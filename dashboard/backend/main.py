from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Tuple
import os, time, json, math, datetime
import ccxt
from dotenv import load_dotenv
from pathlib import Path
from config import CONFIG, NETWORK_PREF, SIMULATE_DEFAULT

load_dotenv()

# Primary API key comes from Doppler via PLUX_API_KEY; fall back to legacy env names.
API_KEY = (
    os.getenv("PLUX_API_KEY", "")
    or os.getenv("PLUSX_API_KEY", "")
    or os.getenv("API_KEY", "")
)

# --- Minimal auth dependency ---
def require_api_key(x_api_key: Optional[str] = Header(None)):
    if not API_KEY:
        return True  # if not set, allow (dev mode). Set API_KEY in prod!
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True

# --- App ---
app = FastAPI(title="xFund_API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCHANGES = ["BYBIT", "MEXC", "KUCOIN", "BINGX", "BITGET", "GATEIO"]

# --- Dead man storage ---
STATE_FILE = Path(__file__).parent / "state.json"
DEFAULT_STATE = {"deadman_last_reset_utc": int(time.time())}

def load_state() -> Dict[str, Any]:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return DEFAULT_STATE.copy()

def save_state(state: Dict[str, Any]):
    STATE_FILE.write_text(json.dumps(state))


@app.get("/api/config")
def get_config():
    return {"apiKey": API_KEY}

# --- CCXT helpers ---
def make_exchange(name: str):
    name_lower = name.lower()
    klass = getattr(ccxt, name_lower, None)
    if not klass:
        raise ValueError(f"Exchange {name} not in ccxt")
    key = os.getenv(f"{name}_API_KEY") or os.getenv(f"{name}_API_KEY".lower())
    secret = os.getenv(f"{name}_API_SECRET") or os.getenv(f"{name}_API_SECRET".lower())
    password = os.getenv(f"{name}_API_PASSWORD") or os.getenv(f"{name}_API_PASSWORD".lower())
    params = {}
    if password:
        params["password"] = password  # KuCoin / Bitget
    # enable unified margin/futures where applicable
    inst = klass({
        "apiKey": key,
        "secret": secret,
        **params
    })
    # Some require explicit options for futures
    inst.options = inst.options or {}
    return inst

def list_exchanges() -> Dict[str, Any]:
    result = {}
    for name in EXCHANGES:
        try:
            result[name] = {"ok": True}
        except Exception as e:
            result[name] = {"ok": False, "error": str(e)}
    return result

# --- Models ---
class RebalanceRequest(BaseModel):
    asset: str  # "USDT" or "USDC"
    execute: bool = False  # if false, dry-run (recommended)

class AutoHedgeRequest(BaseModel):
    execute: bool = False  # if false, dry-run

# --- Utility: fetch spot balances per exchange ---
@app.get("/api/spot-balances")
def get_spot_balances(_: bool = Depends(require_api_key)):
    data = {}
    for name in EXCHANGES:
        try:
            ex = make_exchange(name)
            ex.load_markets()
            bal = ex.fetch_balance(params={"type": "spot"}) if "spot" in str(ex.has) else ex.fetch_balance()
            coins = {}
            for c, v in bal.get("total", {}).items():
                if v and v > 0:
                    coins[c] = v
            data[name] = {"balances": coins}
        except Exception as e:
            data[name] = {"error": str(e)}
    return data

# --- Utility: fetch open perpetual futures trades (positions) ---
def _extract_positions(ex, name: str):
    positions = []
    # Try unified call
    try:
        if hasattr(ex, "fetch_positions") and callable(getattr(ex, "fetch_positions")):
            positions = ex.fetch_positions()
    except Exception:
        pass

    # Some exchanges require per symbol or different markets; fallback to balance/info parsing when needed
    # This is a minimal approach and may need adapting per exchange nuances.

    # Normalize to: symbol, side, contracts, notional, unrealizedPnl, marginType (USDT/USDC)
    normalized = []
    for p in positions or []:
        try:
            symbol = p.get("symbol")
            side = "long" if float(p.get("contracts", 0) or p.get("contracts", 0)) > 0 and float(p.get("entryPrice") or 0) >= 0 and float(p.get("contracts") or 0) >= 0 and (float(p.get("contracts") or 0) * float(p.get("contractSize") or 1)) >= 0 else None
            # Better: use p['side'] if present
            if not side and p.get("side"):
                side = p["side"].lower()
            elif not side:
                # Derive from contracts
                contracts = float(p.get("contracts") or 0)
                side = "long" if contracts > 0 else ("short" if contracts < 0 else "flat")

            contracts = abs(float(p.get("contracts") or 0))
            upnl = float(p.get("unrealizedPnl") or p.get("unrealizedPnl", 0) or 0)
            notional = float(p.get("notional") or p.get("usdValue") or p.get("initialMargin", 0) or 0)
            margin_symbol = p.get("marginMode") or p.get("collateral", "")
            # Heuristic: detect USDT/USDC via info/collateral/quote
            quote = None
            if symbol and ":" in symbol:
                # ccxt sometimes uses "BTC/USDT:USDT"
                try:
                    quote = symbol.split("/")[1].split(":")[0]
                except Exception:
                    pass
            margin_bucket = quote or ("USDT" if "USDT" in json.dumps(p).upper() else ("USDC" if "USDC" in json.dumps(p).upper() else ""))
            side_label = "Long" if side == "long" else ("Short" if side == "short" else "Flat")
            normalized.append({
                "exchange": name,
                "symbol": symbol,
                "side": side_label,
                "contracts": contracts,
                "notional": notional,
                "unrealizedPnl": upnl,
                "margin": margin_bucket
            })
        except Exception:
            continue
    return normalized

@app.get("/api/trades")
def get_trades(_: bool = Depends(require_api_key)):
    usdt_trades = []
    usdc_trades = []
    errors = {}

    for name in EXCHANGES:
        try:
            ex = make_exchange(name)
            ex.load_markets()
            positions = _extract_positions(ex, name)
            for p in positions:
                if p["margin"] == "USDT":
                    usdt_trades.append(p)
                elif p["margin"] == "USDC":
                    usdc_trades.append(p)
        except Exception as e:
            errors[name] = str(e)

    return {
        "USDT": usdt_trades,
        "USDC": usdc_trades,
        "errors": errors
    }

# --- Futures balances per asset (USDT/USDC) ---
def _fetch_futures_balance_quote(ex, quote: str) -> float:
    # Try unified futures balance
    bal = {}
    try:
        bal = ex.fetch_balance(params={"type": "future"})
    except Exception:
        try:
            bal = ex.fetch_balance(params={"type": "swap"})
        except Exception:
            bal = ex.fetch_balance()

    total = 0.0
    # Prefer 'total' quote
    if "total" in bal and quote in bal["total"]:
        v = bal["total"][quote]
        if isinstance(v, (int, float)):
            return float(v)
    # Fallback: parse from 'info'
    try:
        info_str = json.dumps(bal.get("info", {})).upper()
        # heuristic: sum wallet balances that match quote
        if quote.upper() in info_str:
            # as a safe fallback, just return 'free' quote if present
            if "free" in bal and quote in bal["free"] and isinstance(bal["free"][quote], (int,float)):
                return float(bal["free"][quote])
    except Exception:
        pass
    return total

def compute_rebalance_plan(asset: str) -> Dict[str, Any]:
    totals = {}
    for name in EXCHANGES:
        try:
            ex = make_exchange(name)
            ex.load_markets()
            amt = _fetch_futures_balance_quote(ex, asset.upper())
            totals[name] = amt
        except Exception as e:
            totals[name] = {"error": str(e)}

    valid = {k: v for k, v in totals.items() if isinstance(v, (int, float))}
    total_sum = sum(valid.values())
    n = len(valid) if valid else 0
    target = total_sum / n if n else 0.0

    sources = [(ex, bal - target) for ex, bal in valid.items() if bal > target + 1e-8]
    sinks = [(ex, target - bal) for ex, bal in valid.items() if bal < target - 1e-8]

    # Greedy matching
    plan = []
    i = j = 0
    sources.sort(key=lambda x: -x[1])
    sinks.sort(key=lambda x: -x[1])
    while i < len(sources) and j < len(sinks):
        src, excess = sources[i]
        dst, deficit = sinks[j]
        amount = min(excess, deficit)
        plan.append({"from": src, "to": dst, "asset": asset.upper(), "amount": round(amount, 6)})
        excess -= amount
        deficit -= amount
        if excess <= 1e-8:
            i += 1
        else:
            sources[i] = (src, excess)
        if deficit <= 1e-8:
            j += 1
        else:
            sinks[j] = (dst, deficit)

    return {"balances": totals, "target_per_exchange": target, "transfers": plan}

def execute_rebalance(plan: Dict[str, Any]) -> List[Dict[str, Any]]:
    # This calls withdraw() on source exchanges. You must ensure your withdrawal whitelist settings
    # and addresses are properly configured.
    results = []
    for t in plan.get("transfers", []):
        src = t["from"]
        dst = t["to"]
        asset = t["asset"]
        amount = float(t["amount"])
        network = NETWORK_PREF
        dst_addr_book = CONFIG.get("withdrawal_addresses", {}).get(asset, {}).get(dst.upper(), {})
        address = dst_addr_book.get(network) or dst_addr_book.get("ERC20") or dst_addr_book.get("TRC20")
        if not address:
            results.append({"transfer": t, "status": "error", "error": f"No destination address configured for {dst} {asset} on {network}"})
            continue
        try:
            src_ex = make_exchange(src)
            # Many exchanges require tag/memo for certain assets; omitted here.
            wd = src_ex.withdraw(asset, amount, address, params={"network": network})
            results.append({"transfer": t, "status": "ok", "tx": wd})
        except Exception as e:
            results.append({"transfer": t, "status": "error", "error": str(e)})
    return results

@app.post("/api/rebalance")
def rebalance(req: RebalanceRequest, _: bool = Depends(require_api_key)):
    if req.asset.upper() not in ("USDT", "USDC"):
        raise HTTPException(status_code=400, detail="asset must be USDT or USDC")
    plan = compute_rebalance_plan(req.asset.upper())
    if req.execute:
        exec_results = execute_rebalance(plan)
        return {"plan": plan, "results": exec_results}
    else:
        return {"plan": plan, "results": [], "note": "Dry-run. Set execute=true to perform withdrawals."}

# --- Dead Man Switch ---
@app.get("/api/deadman")
def deadman_status(_: bool = Depends(require_api_key)):
    state = load_state()
    last = state.get("deadman_last_reset_utc", int(time.time()))
    now = int(time.time())
    elapsed = now - last
    remaining = max(0, 86400 - elapsed)  # 24h in seconds
    return {"last_reset_utc": last, "seconds_remaining": remaining}

@app.post("/api/deadman/reset")
def deadman_reset(_: bool = Depends(require_api_key)):
    state = load_state()
    state["deadman_last_reset_utc"] = int(time.time())
    save_state(state)
    return {"ok": True}

def summarize_positions(trades: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    # returns symbol -> {"long": qty, "short": qty}
    summary = {}
    for p in trades:
        sym = p["symbol"]
        side = p["side"]
        qty = float(p["contracts"] or 0)
        if not sym or qty <= 0:
            continue
        if sym not in summary:
            summary[sym] = {"Long": 0.0, "Short": 0.0}
        summary[sym][side] = summary[sym].get(side, 0.0) + qty
    return summary

def plan_autohedge(trades: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    # For both USDT and USDC buckets, compute net imbalance per symbol and propose sells of the larger side
    orders = []
    for bucket in ("USDT", "USDC"):
        summary = summarize_positions(trades.get(bucket, []))
        for sym, sides in summary.items():
            long_q = sides.get("Long", 0.0)
            short_q = sides.get("Short", 0.0)
            if abs(long_q - short_q) > 1e-8:
                if long_q > short_q:
                    excess = long_q - short_q
                    # Need to SELL excess longs (open shorts or close longs). We'll close longs preferentially.
                    # Allocate across exchanges holding longs.
                    holders = [p for p in trades[bucket] if p["symbol"] == sym and p["side"] == "Long" and p["contracts"] > 0]
                    remaining = excess
                    for h in holders:
                        take = min(remaining, h["contracts"])
                        if take > 0:
                            orders.append({"exchange": h["exchange"], "symbol": sym, "side": "sell", "amount": take, "reason": f"Reduce excess long by {excess} in {bucket} bucket"})
                            remaining -= take
                            if remaining <= 1e-8:
                                break
                else:
                    excess = short_q - long_q
                    # Need to BUY to cover excess shorts (close shorts). Close shorts preferentially.
                    holders = [p for p in trades[bucket] if p["symbol"] == sym and p["side"] == "Short" and p["contracts"] > 0]
                    remaining = excess
                    for h in holders:
                        take = min(remaining, h["contracts"])
                        if take > 0:
                            orders.append({"exchange": h["exchange"], "symbol": sym, "side": "buy", "amount": take, "reason": f"Reduce excess short by {excess} in {bucket} bucket"})
                            remaining -= take
                            if remaining <= 1e-8:
                                break
    return orders

def execute_orders(orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out = []
    for o in orders:
        try:
            ex = make_exchange(o["exchange"])
            market = ex.market(o["symbol"]) if hasattr(ex, "market") else {"symbol": o["symbol"]}
            # Use market orders on swap/futures
            resp = ex.create_order(o["symbol"], "market", o["side"], o["amount"])
            out.append({"order": o, "status": "ok", "resp": resp})
        except Exception as e:
            out.append({"order": o, "status": "error", "error": str(e)})
    return out

@app.post("/api/autohedge")
def autohedge(req: AutoHedgeRequest, _: bool = Depends(require_api_key)):
    trades = get_trades(_)
    orders = plan_autohedge(trades)
    if req.execute:
        results = execute_orders(orders)
        return {"orders": orders, "results": results}
    else:
        return {"orders": orders, "results": [], "note": "Dry-run. Set execute=true to place orders."}
