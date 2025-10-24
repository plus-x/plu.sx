import os


def _env(key: str, default: str = "") -> str:
    """Fetch environment variable or default placeholder."""
    return os.environ.get(key, default)


def _env_bool(key: str, default: bool) -> bool:
    """Parse boolean environment variables."""
    raw = os.environ.get(key)
    if raw is None:
        return default
    return str(raw).strip().lower() in {"1", "true", "yes", "on"}


CONFIG = {
    "withdrawal_addresses": {
        "USDT": {
            "KUCOIN": {
                "TRC20": _env("ADDR_USDT_TRC20_KUCOIN"),
            },
            "BYBIT": {
                "TRC20": _env("ADDR_USDT_TRC20_BYBIT"),
            },
            "MEXC": {
                "TRC20": _env("ADDR_USDT_TRC20_MEXC"),
            },
            "BINGX": {
                "TRC20": _env("ADDR_USDT_TRC20_BINGX"),
            },
            "BITGET": {
                "TRC20": _env("ADDR_USDT_TRC20_BITGET"),
            },
            "GATEIO": {
                "TRC20": _env("ADDR_USDT_TRC20_GATEIO"),
            },
        },
        "USDC": {
            "KUCOIN": {
                "SOL": _env("ADDR_USDC_SOL_KUCOIN"),
            },
            "BYBIT": {
                "SOL": _env("ADDR_USDC_SOL_BYBIT"),
            },
            "MEXC": {
                "SOL": _env("ADDR_USDC_SOL_MEXC"),
            },
            "BINGX": {
                "SOL": _env("ADDR_USDC_SOL_BINGX"),
            },
            "BITGET": {
                "SOL": _env("ADDR_USDC_SOL_BITGET"),
            },
            "GATEIO": {
                "SOL": _env("ADDR_USDC_SOL_GATEIO"),
            },
        },
    },
    "api": {
        "plusx_api_key": _env("PLUSX_API_KEY"),
    },
    "exchange_credentials": {
        "BYBIT": {
            "api_key": _env("BYBIT_API_KEY"),
            "api_secret": _env("BYBIT_API_SECRET"),
        },
        "MEXC": {
            "api_key": _env("MEXC_API_KEY"),
            "api_secret": _env("MEXC_API_SECRET"),
        },
        "KUCOIN": {
            "api_key": _env("KUCOIN_API_KEY"),
            "api_secret": _env("KUCOIN_API_SECRET"),
            "api_password": _env("KUCOIN_API_PASSWORD"),
        },
        "BINGX": {
            "api_key": _env("BINGX_API_KEY"),
            "api_secret": _env("BINGX_API_SECRET"),
        },
        "BITGET": {
            "api_key": _env("BITGET_API_KEY"),
            "api_secret": _env("BITGET_API_SECRET"),
            "api_password": _env("BITGET_API_PASSWORD"),
        },
        "GATEIO": {
            "api_key": _env("GATEIO_API_KEY"),
            "api_secret": _env("GATEIO_API_SECRET"),
        },
    },
}

NETWORK_PREF = os.environ.get("WITHDRAW_NETWORK_PREFERENCE", "TRC20")
SIMULATE_DEFAULT = _env_bool("SIMULATE_TRANSFERS_BY_DEFAULT", True)

CONFIG["withdraw_network_preference"] = NETWORK_PREF
CONFIG["simulate_transfers_by_default"] = SIMULATE_DEFAULT
