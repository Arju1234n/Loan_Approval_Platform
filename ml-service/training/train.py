"""
AI-Powered Loan Approval System
Phase 1: Machine Learning Model Training
Dataset: CreditWise Loan Approval Dataset
"""

import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────
# STEP 1: Load Dataset
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 1: Loading Dataset")
print("="*60)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'dataset', 'loan_data.csv')

df = pd.read_csv(DATA_PATH)
print(f"✓ Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns")

# ─────────────────────────────────────────────
# STEP 2: Data Analysis
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 2: Data Analysis")
print("="*60)

print("\n── Null Values per Column ──")
print(df.isnull().sum())

print("\n── Data Types ──")
print(df.dtypes)

print(f"\n── Duplicates: {df.duplicated().sum()} ──")

print("\n── Target Distribution (Loan_Approved) ──")
print(df['Loan_Approved'].value_counts())

# ─────────────────────────────────────────────
# STEP 3: Data Cleaning
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 3: Data Cleaning")
print("="*60)

# Drop Applicant_ID (just an identifier)
df.drop(columns=['Applicant_ID'], inplace=True, errors='ignore')

# Remove duplicates
before = len(df)
df.drop_duplicates(inplace=True)
print(f"✓ Removed {before - len(df)} duplicate rows")

# Drop rows with missing target
df.dropna(subset=['Loan_Approved'], inplace=True)

# Convert target to binary (Yes/No → 1/0)
df['Loan_Approved'] = df['Loan_Approved'].map({'Yes': 1, 'No': 0})

# Fill numeric missing values with median
num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
num_cols = [c for c in num_cols if c != 'Loan_Approved']
for col in num_cols:
    median_val = df[col].median()
    df[col].fillna(median_val, inplace=True)
    print(f"  ✓ Filled '{col}' nulls with median ({median_val:.2f})")

# Fill categorical missing values with mode
cat_cols = df.select_dtypes(include=['object']).columns.tolist()
for col in cat_cols:
    mode_val = df[col].mode()[0]
    df[col].fillna(mode_val, inplace=True)
    print(f"  ✓ Filled '{col}' nulls with mode ('{mode_val}')")

print(f"\n✓ Clean dataset: {df.shape[0]} rows × {df.shape[1]} columns")
print(f"✓ Remaining nulls: {df.isnull().sum().sum()}")

# ─────────────────────────────────────────────
# STEP 4: Feature Engineering
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 4: Feature Engineering")
print("="*60)

categorical_features = [
    'Employment_Status', 'Marital_Status', 'Property_Area',
    'Education_Level', 'Gender', 'Employer_Category', 'Loan_Purpose'
]

label_encoders = {}
for col in categorical_features:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le
    print(f"  ✓ Encoded '{col}' → classes: {list(le.classes_)}")

# Save label encoders
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)
joblib.dump(label_encoders, os.path.join(MODELS_DIR, 'label_encoders.pkl'))
print(f"\n✓ Label encoders saved")

# ─────────────────────────────────────────────
# STEP 5: Train/Test Split
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 5: Train/Test Split (80/20)")
print("="*60)

feature_cols = [c for c in df.columns if c != 'Loan_Approved']
X = df[feature_cols]
y = df['Loan_Approved']

# Save feature columns order
joblib.dump(feature_cols, os.path.join(MODELS_DIR, 'feature_columns.pkl'))
print(f"✓ Features: {feature_cols}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))

print(f"✓ Train set: {X_train.shape[0]} samples")
print(f"✓ Test set:  {X_test.shape[0]} samples")

# ─────────────────────────────────────────────
# STEP 6: Train Models
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 6: Training Models")
print("="*60)

models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'KNN': KNeighborsClassifier(n_neighbors=5),
    'Naive Bayes': GaussianNB()
}

results = {}
trained_models = {}

for name, model in models.items():
    print(f"\n  Training {name}...")
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    trained_models[name] = model

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec  = recall_score(y_test, y_pred, zero_division=0)
    f1   = f1_score(y_test, y_pred, zero_division=0)
    cm   = confusion_matrix(y_test, y_pred).tolist()

    results[name] = {
        'accuracy':  round(acc, 4),
        'precision': round(prec, 4),
        'recall':    round(rec, 4),
        'f1_score':  round(f1, 4),
        'confusion_matrix': cm
    }
    print(f"    ✓ Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")

# ─────────────────────────────────────────────
# STEP 7: Evaluate & Compare
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 7 & 8: Model Evaluation Comparison")
print("="*60)

print(f"\n{'Model':<25} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1 Score':>10}")
print("-" * 65)
for name, metrics in results.items():
    print(f"{name:<25} {metrics['accuracy']:>10.4f} {metrics['precision']:>10.4f} "
          f"{metrics['recall']:>10.4f} {metrics['f1_score']:>10.4f}")

# ─────────────────────────────────────────────
# STEP 9: Select Best Model
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 9: Best Model Selection")
print("="*60)

best_model_name = max(results, key=lambda k: results[k]['f1_score'])
best_model = trained_models[best_model_name]
best_metrics = results[best_model_name]

print(f"\n🏆 Best Model: {best_model_name}")
print(f"   F1 Score:  {best_metrics['f1_score']:.4f}")
print(f"   Accuracy:  {best_metrics['accuracy']:.4f}")
print(f"   Precision: {best_metrics['precision']:.4f}")
print(f"   Recall:    {best_metrics['recall']:.4f}")

# ─────────────────────────────────────────────
# STEP 10: Save Best Model
# ─────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 10: Saving Model")
print("="*60)

MODEL_PATH = os.path.join(MODELS_DIR, 'loan_model.pkl')
joblib.dump(best_model, MODEL_PATH)
print(f"✓ Model saved → {MODEL_PATH}")

# Save results metadata
metadata = {
    'best_model': best_model_name,
    'metrics': best_metrics,
    'all_results': results,
    'feature_columns': feature_cols,
    'categorical_features': categorical_features
}
with open(os.path.join(MODELS_DIR, 'model_metadata.json'), 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"✓ Metadata saved → model_metadata.json")

print("\n" + "="*60)
print("✅ TRAINING COMPLETE!")
print("="*60)
print(f"   Best Model: {best_model_name}")
print(f"   Saved to:   {MODEL_PATH}")
