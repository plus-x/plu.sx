# xFund Bot MVP

This repository contains a minimal implementation of the requirements:

- Internal **xFund_API** using **CCXT** to fetch spot balances and open perp positions, plus endpoints for **Rebalance** and **Auto‑Hedge**.
- **Dashboard UI** (React + Vite) to display balances, trades, a loading bar, and a **Dead Man Switch** button/timer.
- **Minimal Security** via an API key header.

## Structure
```
xfund-bot/
  backend/  # FastAPI + CCXT
  frontend/ # React + Vite
```

## Quickstart

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# fill API_KEY and exchange credentials you intend to use
cp config.example.json config.json  # fill deposit addresses for rebalancing
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the browser (default http://localhost:5173), set your API key, and click **Refresh**.

## Notes
- Rebalancing uses on-chain **withdraw()** from source exchanges. Configure `config.json` with destination deposit addresses and a preferred network (e.g., TRC20). Start with dry‑runs.
- Auto‑hedge computes symbol‑level imbalance per margin bucket (USDT, USDC) and creates **market** orders to flatten the excess side on the exchanges holding it. Start with dry‑runs.
- The "Dead Man Switch" uses UTC time and requires a click within 24 hours to avoid the auto‑hedge condition (you can wire a scheduler/cron to call `/api/deadman` and trigger `/api/autohedge` when remaining hits 0 if desired).
