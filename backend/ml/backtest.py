import pandas as pd
import numpy as np

def run_backtest(df: pd.DataFrame, symbol: str = "STOCK") -> dict:
    """Enhanced backtest with multiple strategies to generate more trades"""
    
    df = df.copy()
    
    # Strategy 1: Traditional crossover (buy on bullish, sell on bearish)
    df['Prev_Signal'] = df['Signal'].shift(1)
    df['Crossover'] = 0
    
    # Bullish crossover: -1 to 1 or 0 to 1
    df.loc[(df['Signal'] == 1) & (df['Prev_Signal'] <= 0), 'Crossover'] = 1
    
    # Bearish crossover: 1 to -1 or 0 to -1
    df.loc[(df['Signal'] == -1) & (df['Prev_Signal'] >= 0), 'Crossover'] = -1
    
    trade_logs = []
    position = None
    entry_date = None
    entry_price = 0
    
    initial_capital = 100000
    
    # Strategy 1: Traditional crossover trades
    for idx, row in df.iterrows():
        if row['Crossover'] == 1 and position is None:
            # Enter long on bullish crossover
            position = 'long'
            entry_date = idx
            entry_price = row['Close']
            
        elif row['Crossover'] == -1 and position == 'long':
            # Exit long on bearish crossover
            exit_date = idx
            exit_price = row['Close']
            profit = exit_price - entry_price
            profit_pct = (profit / entry_price) * 100
            
            trade_logs.append({
                'stock': symbol,
                'entry_date': entry_date.strftime('%d-%m-%Y') if hasattr(entry_date, 'strftime') else str(entry_date),
                'exit_date': exit_date.strftime('%d-%m-%Y') if hasattr(exit_date, 'strftime') else str(exit_date),
                'entry_price': round(entry_price, 2),
                'exit_price': round(exit_price, 2),
                'profit': round(profit, 2),
                'profit_pct': round(profit_pct, 2)
            })
            
            position = None
    
    # Strategy 2: If we have very few trades, use signal-based strategy
    # This generates more trades by entering/exiting based on signal changes
    if len(trade_logs) < 5:
        trade_logs = []
        position = None
        entry_date = None
        entry_price = 0
        
        # Use signal changes more aggressively
        df['Signal_Change'] = df['Signal'].diff()
        
        for idx, row in df.iterrows():
            # Enter on any signal change to bullish (from bearish or neutral)
            if row['Signal'] == 1 and position is None:
                # Check if we're transitioning from bearish or neutral
                prev_signal = df.loc[df.index < idx, 'Signal'].iloc[-1] if len(df.loc[df.index < idx]) > 0 else 0
                if prev_signal <= 0:
                    position = 'long'
                    entry_date = idx
                    entry_price = row['Close']
            
            # Exit on any signal change to bearish (from bullish or neutral)
            elif row['Signal'] == -1 and position == 'long':
                exit_date = idx
                exit_price = row['Close']
                profit = exit_price - entry_price
                profit_pct = (profit / entry_price) * 100
                
                trade_logs.append({
                    'stock': symbol,
                    'entry_date': entry_date.strftime('%d-%m-%Y') if hasattr(entry_date, 'strftime') else str(entry_date),
                    'exit_date': exit_date.strftime('%d-%m-%Y') if hasattr(exit_date, 'strftime') else str(exit_date),
                    'entry_price': round(entry_price, 2),
                    'exit_price': round(exit_price, 2),
                    'profit': round(profit, 2),
                    'profit_pct': round(profit_pct, 2)
                })
                
                position = None
    
    # Strategy 3: If still very few trades, use time-based exits
    # Hold for minimum period, then exit on opposite signal
    if len(trade_logs) < 3:
        trade_logs = []
        position = None
        entry_date = None
        entry_price = 0
        min_hold_days = 5  # Minimum holding period
        entry_idx = None
        
        for i, (idx, row) in enumerate(df.iterrows()):
            if row['Crossover'] == 1 and position is None:
                position = 'long'
                entry_date = idx
                entry_price = row['Close']
                entry_idx = i
                
            elif position == 'long':
                days_held = i - entry_idx if entry_idx is not None else 0
                
                # Exit conditions: bearish crossover OR hold for 20+ days
                if row['Crossover'] == -1 or days_held >= 20:
                    exit_date = idx
                    exit_price = row['Close']
                    profit = exit_price - entry_price
                    profit_pct = (profit / entry_price) * 100
                    
                    trade_logs.append({
                        'stock': symbol,
                        'entry_date': entry_date.strftime('%d-%m-%Y') if hasattr(entry_date, 'strftime') else str(entry_date),
                        'exit_date': exit_date.strftime('%d-%m-%Y') if hasattr(exit_date, 'strftime') else str(exit_date),
                        'entry_price': round(entry_price, 2),
                        'exit_price': round(exit_price, 2),
                        'profit': round(profit, 2),
                        'profit_pct': round(profit_pct, 2)
                    })
                    
                    position = None
    
    # Strategy 4: Last resort - generate trades based on EMA proximity
    # Enter when EMAs are close and trending, exit on divergence
    if len(trade_logs) < 2:
        trade_logs = []
        position = None
        entry_date = None
        entry_price = 0
        
        # Calculate EMA distance
        df['EMA_Distance'] = abs(df['EMA_20'] - df['EMA_50']) / df['EMA_50'] * 100
        
        for i, (idx, row) in enumerate(df.iterrows()):
            # Enter when EMAs converge and EMA20 is above EMA50
            if position is None and row['EMA_20'] > row['EMA_50'] and row['EMA_Distance'] < 2:
                position = 'long'
                entry_date = idx
                entry_price = row['Close']
                
            # Exit when EMAs diverge significantly or EMA20 crosses below
            elif position == 'long':
                if row['EMA_20'] < row['EMA_50'] or row['EMA_Distance'] > 5:
                    exit_date = idx
                    exit_price = row['Close']
                    profit = exit_price - entry_price
                    profit_pct = (profit / entry_price) * 100
                    
                    trade_logs.append({
                        'stock': symbol,
                        'entry_date': entry_date.strftime('%d-%m-%Y') if hasattr(entry_date, 'strftime') else str(entry_date),
                        'exit_date': exit_date.strftime('%d-%m-%Y') if hasattr(exit_date, 'strftime') else str(exit_date),
                        'entry_price': round(entry_price, 2),
                        'exit_price': round(exit_price, 2),
                        'profit': round(profit, 2),
                        'profit_pct': round(profit_pct, 2)
                    })
                    
                    position = None
    
    # Close any open position at the end
    if position == 'long':
        exit_date = df.index[-1]
        exit_price = df.iloc[-1]['Close']
        profit = exit_price - entry_price
        profit_pct = (profit / entry_price) * 100
        
        trade_logs.append({
            'stock': symbol,
            'entry_date': entry_date.strftime('%d-%m-%Y') if hasattr(entry_date, 'strftime') else str(entry_date),
            'exit_date': exit_date.strftime('%d-%m-%Y') if hasattr(exit_date, 'strftime') else str(exit_date),
            'entry_price': round(entry_price, 2),
            'exit_price': round(exit_price, 2),
            'profit': round(profit, 2),
            'profit_pct': round(profit_pct, 2)
        })
    
    if len(trade_logs) == 0:
        return {
            "trade_logs": [],
            "summary": {
                "number_of_trades": 0,
                "invested_amount": 0,
                "final_amount": initial_capital,
                "win_rate_pct": 0,
                "risk_reward_ratio": 0,
                "avg_profit_pct": 0,
                "max_loss_pct": 0,
                "max_win_pct": 0,
                "profit_factor": 0,
                "pnl_pct": 0,
                "avg_loss_pct": 0,
                "max_drawdown_pct": 0
            }
        }
    
    # Calculate summary statistics
    profits = [t['profit_pct'] for t in trade_logs]
    winning_trades = [p for p in profits if p > 0]
    losing_trades = [p for p in profits if p < 0]
    
    num_trades = len(trade_logs)
    win_rate = (len(winning_trades) / num_trades * 100) if num_trades > 0 else 0
    
    # Calculate invested and final amounts
    invested_amount = sum(t['entry_price'] for t in trade_logs)
    final_amount = initial_capital + sum(t['profit'] for t in trade_logs)
    pnl_pct = ((final_amount - initial_capital) / initial_capital) * 100 if initial_capital > 0 else 0
    
    # Risk-reward ratio
    avg_win = np.mean(winning_trades) if winning_trades else 0
    avg_loss = abs(np.mean(losing_trades)) if losing_trades else 1
    risk_reward = avg_win / avg_loss if avg_loss > 0 else 0
    
    # Profit factor
    total_wins = sum(winning_trades) if winning_trades else 0
    total_losses = abs(sum(losing_trades)) if losing_trades else 1
    profit_factor = total_wins / total_losses if total_losses > 0 else 0
    
    # Max win/loss
    max_win = max(profits) if profits else 0
    max_loss = min(profits) if profits else 0
    
    # Average profit/loss
    avg_profit = np.mean(profits) if profits else 0
    avg_loss = np.mean(losing_trades) if losing_trades else 0
    
    # Max drawdown (simplified)
    equity = initial_capital
    peak = initial_capital
    max_dd = 0
    for trade in trade_logs:
        equity += trade['profit']
        if equity > peak:
            peak = equity
        dd = ((peak - equity) / peak) * 100 if peak > 0 else 0
        if dd > max_dd:
            max_dd = dd
    
    return {
        "trade_logs": trade_logs,
        "summary": {
            "number_of_trades": num_trades,
            "invested_amount": round(invested_amount, 2),
            "final_amount": round(final_amount, 2),
            "win_rate_pct": round(win_rate, 2),
            "risk_reward_ratio": round(risk_reward, 2),
            "avg_profit_pct": round(avg_profit, 2),
            "max_loss_pct": round(max_loss, 2),
            "max_win_pct": round(max_win, 2),
            "profit_factor": round(profit_factor, 2),
            "pnl_pct": round(pnl_pct, 2),
            "avg_loss_pct": round(avg_loss, 2),
            "max_drawdown_pct": round(max_dd, 2)
        }
    }
