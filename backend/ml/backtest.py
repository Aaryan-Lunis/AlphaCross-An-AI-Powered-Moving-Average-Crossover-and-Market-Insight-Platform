import pandas as pd
import numpy as np

import pandas as pd


def run_advanced_backtest(df: pd.DataFrame, symbol: str, config: dict):
    """
    Executes a realistic, single-position backtest using precomputed
    entry_signal and exit_signal columns.

    Trade rules:
    - One position at a time (LONG only)
    - Exit priority:
        1. Stop Loss
        2. Take Profit
        3. Max Holding Days
        4. Strategy Exit Signal
        5. Forced EOD Exit
    - Prevents same-bar re-entry
    """

    trades = []

    # Position state
    state = "FLAT"   # FLAT | LONG
    entry_data = {}
    just_exited = False  # Prevent same-bar re-entry

    for i in range(len(df)):
        row = df.iloc[i]
        price = float(row["Close"])
        is_last_candle = (i == len(df) - 1)

        # -------------------------
        # ENTRY LOGIC
        # -------------------------
        if state == "FLAT":
            if row.get("entry_signal", False) and not just_exited:
                state = "LONG"
                entry_data = {
                    "symbol": symbol,
                    "entry_date": df.index[i].strftime("%Y-%m-%d"),
                    "entry_price": price,
                    "days_held": 0,
                }
            just_exited = False

        # -------------------------
        # EXIT LOGIC
        # -------------------------
        elif state == "LONG":
            entry_data["days_held"] += 1
            ret_pct = (price - entry_data["entry_price"]) / entry_data["entry_price"] * 100

            exit_reason = None

            # Exit priority
            if ret_pct <= -config["stop_loss_pct"]:
                exit_reason = "Stop Loss"
            elif ret_pct >= config["take_profit_pct"]:
                exit_reason = "Take Profit"
            elif entry_data["days_held"] >= config["max_holding_days"]:
                exit_reason = "Max Days"
            elif row.get("exit_signal", False):
                exit_reason = "Strategy Signal"
            elif is_last_candle:
                exit_reason = "Forced EOD Exit"

            if exit_reason:
                trades.append({
                    **entry_data,
                    "exit_date": df.index[i].strftime("%Y-%m-%d"),
                    "exit_price": price,
                    "profit_pct": round(ret_pct, 2),
                    "exit_reason": exit_reason,
                })

                state = "FLAT"
                just_exited = True

    return trades

