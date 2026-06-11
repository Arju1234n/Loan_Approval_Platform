"""
Standalone batch prediction script.

Usage (from ml-service/ directory):
    python prediction/predict.py --input data/batch.csv --output results/predictions.csv
"""

import argparse
import sys
import os
import joblib
import pandas as pd

# Allow imports from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from preprocessing.preprocessing import drop_id_column, fill_missing_values, encode_categoricals


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')


def load_artifacts():
    model     = joblib.load(os.path.join(MODELS_DIR, 'loan_model.pkl'))
    scaler    = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
    encoders  = joblib.load(os.path.join(MODELS_DIR, 'label_encoders.pkl'))
    feat_cols = joblib.load(os.path.join(MODELS_DIR, 'feature_columns.pkl'))
    return model, scaler, encoders, feat_cols


def predict_batch(input_path: str, output_path: str):
    model, scaler, encoders, feat_cols = load_artifacts()

    df = pd.read_csv(input_path)
    df = drop_id_column(df)
    df = fill_missing_values(df)
    df, _ = encode_categoricals(df, encoders)

    # Align columns
    for col in feat_cols:
        if col not in df.columns:
            df[col] = 0
    df = df[feat_cols]

    X = scaler.transform(df)
    preds = model.predict(X)
    probs = model.predict_proba(X)[:, 1]

    df['Loan_Approved']  = preds
    df['Confidence']     = probs.round(4)
    df['Decision']       = df['Loan_Approved'].map({1: 'Approved', 0: 'Rejected'})

    df.to_csv(output_path, index=False)
    print(f"✓ Predictions saved to: {output_path}")
    return df


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='CreditWise batch predictor')
    parser.add_argument('--input',  required=True, help='Path to input CSV')
    parser.add_argument('--output', required=True, help='Path to output CSV')
    args = parser.parse_args()
    predict_batch(args.input, args.output)
