# xFund_API (Backend)

FastAPI service that wraps CCXT for balances, positions, rebalancing, and auto-hedge control, with a simple dead-man switch.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# fill in API_KEY and exchange credentials (only those you use)
cp config.example.json config.json  # then fill deposit addresses for each destination exchange
uvicorn main:app --reload --port 8000
```

### Auth
All endpoints require header: `X-API-Key: <value from .env API_KEY>` (if API_KEY is empty, auth is disabled for dev).

### Endpoints
- `GET /api/spot-balances`
- `GET /api/trades`  (normalizes open perp positions; USDT & USDC buckets)
- `POST /api/rebalance` body: `{ "asset": "USDT"|"USDC", "execute": false }`
- `GET /api/deadman`  (returns seconds_remaining to 24h deadline, UTC-based)
- `POST /api/deadman/reset`
- `POST /api/autohedge` body: `{ "execute": false }` (plans or executes market orders to neutralize imbalances)

> **Safety**: Rebalance uses `withdraw()` on source exchanges; ensure whitelists and `config.json` are correct. Auto-hedge uses `create_order(..., 'market', ...)` on futures markets; validate symbols & permissions first.
