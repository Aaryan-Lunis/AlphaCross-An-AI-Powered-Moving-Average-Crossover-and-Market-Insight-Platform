import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler

def train_and_predict(df: pd.DataFrame):
    """Train XGBoost model and predict upcoming crossover"""
    
    feature_cols = ['EMA_20', 'EMA_50', 'EMA_20_slope', 'EMA_50_slope', 
                    'RSI', 'Returns', 'Volatility']
    
    # Check if we have enough data
    if len(df) < 30:
        raise ValueError(f"Not enough data. Have {len(df)} rows, need at least 30")
    
    # Prepare training data - exclude last 2 rows for target
    X_train = df[feature_cols].iloc[:-2].values
    y_target = df['Target'].iloc[:-2].values
    
    # Check if Target has enough class diversity
    unique_targets = np.unique(y_target[~np.isnan(y_target)])
    
    # If Target doesn't have enough diversity or is mostly NaN, use Signal
    if len(unique_targets) < 2 or np.sum(~np.isnan(y_target)) < 10:
        print("Target has insufficient diversity, using Signal instead")
        X_train = df[feature_cols].iloc[:-1].values  # Use all but last for prediction
        y_target = df['Signal'].iloc[:-1].values
    else:
        # Remove NaN rows from Target
        valid_mask = ~np.isnan(y_target)
        X_train = X_train[valid_mask]
        y_target = y_target[valid_mask]
    
    print(f"Training data shape: X={X_train.shape}, y={y_target.shape}")
    print(f"Unique y values before mapping: {np.unique(y_target)}")
    
    # Check if we have enough data after filtering
    if len(X_train) < 10:
        # Fallback: use Signal on all data
        X_train = df[feature_cols].iloc[:-1].values
        y_target = df['Signal'].iloc[:-1].values
        print(f"Using Signal fallback: X={X_train.shape}, y={y_target.shape}")
    
    # Store original unique values for reverse mapping
    original_unique = np.unique(y_target)
    
    # Convert labels from [-1, 0, 1] to [0, 1, 2] for XGBoost
    y_mapped = (y_target + 1).astype(int)  # Now: -1->0, 0->1, 1->2
    unique_mapped = np.unique(y_mapped)
    print(f"Unique y values after mapping: {unique_mapped}")
    
    # If still only one class, use simple rule-based prediction
    if len(unique_mapped) < 2:
        print("Warning: Only one class in data, using rule-based prediction")
        latest = df.iloc[-1]
        if latest['EMA_20'] > latest['EMA_50']:
            prediction = 1  # Bullish
            confidence = 0.65
        elif latest['EMA_20'] < latest['EMA_50']:
            prediction = -1  # Bearish
            confidence = 0.65
        else:
            prediction = 0  # Neutral
            confidence = 0.5
        return prediction, confidence
    
    # Handle binary classification - remap to [0, 1] if needed
    num_classes = len(unique_mapped)
    binary_remap_needed = False
    if num_classes == 2:
        # For binary, ensure classes are [0, 1]
        if 0 in unique_mapped and 2 in unique_mapped:
            # We have -1 and 1, remap to [0, 1]
            y_mapped = np.where(y_mapped == 0, 0, 1)
            unique_mapped = np.unique(y_mapped)
            binary_remap_needed = True
            print(f"Remapped binary classes to: {unique_mapped}")
        elif 1 in unique_mapped and 2 in unique_mapped:
            # We have 0 and 1, remap to [0, 1]
            y_mapped = np.where(y_mapped == 1, 0, 1)
            unique_mapped = np.unique(y_mapped)
            binary_remap_needed = True
            print(f"Remapped binary classes to: {unique_mapped}")
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    
    # Train model with reduced complexity
    # Set num_class explicitly if we have 3 classes
    num_classes = len(unique_mapped)
    model_params = {
        'n_estimators': 50,
        'max_depth': 3,
        'learning_rate': 0.1,
        'random_state': 42,
        'eval_metric': 'mlogloss',
        'verbosity': 0
    }
    
    if num_classes == 3:
        model_params['objective'] = 'multi:softprob'
        model_params['num_class'] = 3
    else:
        # Binary classification
        model_params['objective'] = 'binary:logistic'
    
    model = XGBClassifier(**model_params)
    
    print(f"Training model with {num_classes} classes...")
    model.fit(X_scaled, y_mapped)
    print(f"Model trained successfully")
    
    # Predict on latest data
    X_latest = df[feature_cols].iloc[-1:].values
    X_latest_scaled = scaler.transform(X_latest)
    
    prediction_mapped = model.predict(X_latest_scaled)[0]
    probabilities = model.predict_proba(X_latest_scaled)[0]
    
    print(f"Raw prediction: {prediction_mapped}, probabilities: {probabilities}")
    
    # Convert back to original scale
    if num_classes == 3:
        # [0, 1, 2] -> [-1, 0, 1]
        prediction = int(prediction_mapped - 1)
    else:
        # Binary: [0, 1] -> need to map back
        if binary_remap_needed:
            # Check original unique values to map back correctly
            if -1 in original_unique and 1 in original_unique:
                # Binary was -1 and 1, remapped to [0, 1]
                prediction = int(prediction_mapped * 2 - 1)  # 0->-1, 1->1
            elif 0 in original_unique and 1 in original_unique:
                # Binary was 0 and 1, remapped to [0, 1]
                prediction = int(prediction_mapped)  # 0->0, 1->1
            else:
                # Fallback
                prediction = int(prediction_mapped - 1)
        else:
            # No remap was needed, direct conversion
            prediction = int(prediction_mapped - 1)
    
    # Get confidence (max probability)
    confidence = float(np.max(probabilities))
    
    return prediction, confidence