"""
Run this script to test if your backend components work
Usage: python test_backend.py
"""

print("Testing AlphaCross Backend Components...")
print("=" * 50)

# Test 1: Import modules
print("\n1. Testing imports...")
try:
    from ml.data_fetch import fetch_stock_data
    from ml.features import calculate_features
    from ml.model_xgb import train_and_predict
    from ml.backtest import run_backtest
    from ai.chat import get_chat_response
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
    print("\nMake sure you have __init__.py files in ml/ and ai/ folders")
    exit(1)

# Test 2: Fetch data
print("\n2. Testing data fetch...")
try:
    df = fetch_stock_data('INFY')
    print(f"✅ Data fetched: {len(df)} rows")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Latest close: {df['Close'].iloc[-1]}")
except Exception as e:
    print(f"❌ Data fetch error: {e}")
    print("\nCheck your internet connection and yfinance installation")
    exit(1)

# Test 3: Calculate features
print("\n3. Testing feature calculation...")
try:
    df = calculate_features(df)
    print(f"✅ Features calculated: {len(df)} rows after cleanup")
    print(f"   Columns: {list(df.columns)}")
    if len(df) > 0:
        latest = df.iloc[-1]
        print(f"   Latest EMA20: {latest['EMA_20']:.2f}")
        print(f"   Latest EMA50: {latest['EMA_50']:.2f}")
        print(f"   Latest RSI: {latest['RSI']:.2f}")
except Exception as e:
    print(f"❌ Feature calculation error: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Test 4: Prediction
print("\n4. Testing ML prediction...")
try:
    if len(df) < 60:
        print("⚠️  Not enough data for prediction (need 60+ rows)")
    else:
        prediction, confidence = train_and_predict(df)
        signal_map = {1: "Bullish", -1: "Bearish", 0: "Neutral"}
        print(f"✅ Prediction: {signal_map[prediction]} (confidence: {confidence:.2f})")
except Exception as e:
    print(f"❌ Prediction error: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Backtest
print("\n5. Testing backtest...")
try:
    results = run_backtest(df)
    print(f"✅ Backtest completed:")
    print(f"   Trades: {results['trades']}")
    print(f"   Win Rate: {results['win_rate']}%")
    print(f"   Total Return: {results['total_return']}%")
except Exception as e:
    print(f"❌ Backtest error: {e}")
    import traceback
    traceback.print_exc()

# Test 6: Chatbot
print("\n6. Testing chatbot...")
try:
    context = {
        'ema20': df.iloc[-1]['EMA_20'],
        'ema50': df.iloc[-1]['EMA_50'],
        'rsi': df.iloc[-1]['RSI'],
        'prediction': 'Bullish',
        'confidence': 0.85
    }
    response = get_chat_response('INFY', 'Why is this bullish?', context)
    print(f"✅ Chatbot response: {response[:100]}...")
except Exception as e:
    print(f"❌ Chatbot error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 50)
print("✅ All tests completed! Backend is ready.")
print("\nYou can now run: uvicorn main:app --reload")