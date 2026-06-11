"""
Phase 2: FastAPI ML Microservice
Endpoints: GET /, GET /health, POST /predict
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import numpy as np
import os
import json
from datetime import datetime

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────
app = FastAPI(
    title="CreditWise ML Engine",
    description="AI-Powered Loan Approval Prediction Microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Load Models
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

model           = joblib.load(os.path.join(MODELS_DIR, 'loan_model.pkl'))
scaler          = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
label_encoders  = joblib.load(os.path.join(MODELS_DIR, 'label_encoders.pkl'))
feature_columns = joblib.load(os.path.join(MODELS_DIR, 'feature_columns.pkl'))

with open(os.path.join(MODELS_DIR, 'model_metadata.json')) as f:
    metadata = json.load(f)

# ─────────────────────────────────────────────
# Encoding Maps
# ─────────────────────────────────────────────
EMPLOYMENT_STATUS_MAP = {
    'Contract': 0, 'Salaried': 1, 'Self-employed': 2, 'Unemployed': 3
}
MARITAL_STATUS_MAP = {'Married': 0, 'Single': 1}
PROPERTY_AREA_MAP  = {'Rural': 0, 'Semiurban': 1, 'Urban': 2}
EDUCATION_LEVEL_MAP = {'Graduate': 0, 'Not Graduate': 1}
GENDER_MAP          = {'Female': 0, 'Male': 1}
EMPLOYER_CATEGORY_MAP = {
    'Business': 0, 'Government': 1, 'MNC': 2, 'Private': 3, 'Unemployed': 4
}
LOAN_PURPOSE_MAP = {
    'Business': 0, 'Car': 1, 'Education': 2, 'Home': 3, 'Personal': 4
}

# ─────────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────────
class LoanPredictionRequest(BaseModel):
    applicant_income:     float = Field(..., gt=0, example=15000)
    coapplicant_income:   float = Field(..., ge=0, example=5000)
    employment_status:    str   = Field(..., example="Salaried")
    age:                  int   = Field(..., gt=18, lt=100, example=35)
    marital_status:       str   = Field(..., example="Married")
    dependents:           int   = Field(..., ge=0, example=1)
    credit_score:         int   = Field(..., ge=300, le=900, example=720)
    existing_loans:       int   = Field(..., ge=0, example=1)
    dti_ratio:            float = Field(..., ge=0, le=1, example=0.3)
    savings:              float = Field(..., ge=0, example=15000)
    collateral_value:     float = Field(..., ge=0, example=25000)
    loan_amount:          float = Field(..., gt=0, example=20000)
    loan_term:            int   = Field(..., gt=0, example=48)
    loan_purpose:         str   = Field(..., example="Home")
    property_area:        str   = Field(..., example="Urban")
    education_level:      str   = Field(..., example="Graduate")
    gender:               str   = Field(..., example="Male")
    employer_category:    str   = Field(..., example="Private")

class LoanPredictionResponse(BaseModel):
    prediction:     str
    approved:       bool
    confidence:     float
    confidence_pct: str
    reasons:        List[str]
    risk_factors:   List[str]
    model_used:     str
    timestamp:      str

# ─────────────────────────────────────────────
# Explainable AI Helper
# ─────────────────────────────────────────────
def generate_reasons(data: dict, approved: bool) -> tuple:
    reasons = []
    risks   = []

    cs = data.get('credit_score', 0)
    dti = data.get('dti_ratio', 1)
    savings = data.get('savings', 0)
    existing = data.get('existing_loans', 0)
    income = data.get('applicant_income', 0)
    coapplicant = data.get('coapplicant_income', 0)
    total_income = income + coapplicant

    # Credit Score
    if cs >= 750:
        reasons.append("Excellent Credit Score (≥750)")
    elif cs >= 700:
        reasons.append("Good Credit Score (700-749)")
    elif cs < 600:
        risks.append("Low Credit Score (<600)")
    else:
        risks.append("Below Average Credit Score")

    # DTI Ratio
    if dti <= 0.30:
        reasons.append("Low Debt-to-Income Ratio")
    elif dti >= 0.55:
        risks.append("High Debt-to-Income Ratio (≥55%)")
    else:
        risks.append("Moderate Debt-to-Income Ratio")

    # Savings
    if savings >= 15000:
        reasons.append("Strong Savings Profile")
    elif savings < 5000:
        risks.append("Low Savings Balance")

    # Existing Loans
    if existing == 0:
        reasons.append("No Existing Loan Obligations")
    elif existing <= 1:
        reasons.append("Minimal Existing Loans")
    elif existing >= 4:
        risks.append("High Number of Existing Loans")

    # Income
    if total_income >= 20000:
        reasons.append("High Combined Income")
    elif total_income >= 10000:
        reasons.append("Stable Income")
    else:
        risks.append("Low Income Level")

    # Employment
    emp = data.get('employment_status', '')
    if emp in ['Salaried', 1]:
        reasons.append("Stable Salaried Employment")
    elif emp in ['Self-employed', 2]:
        risks.append("Self-employment (Variable Income)")

    return (reasons[:4], risks[:4])


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "CreditWise ML Engine",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health":  "GET  /health",
            "predict": "POST /predict"
        }
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": metadata.get("best_model"),
        "accuracy": metadata["metrics"]["accuracy"],
        "f1_score": metadata["metrics"]["f1_score"],
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/predict", response_model=LoanPredictionResponse)
def predict(req: LoanPredictionRequest):
    try:
        data = req.dict()

        # Encode categorical fields
        encoded = {
            'Applicant_Income':   data['applicant_income'],
            'Coapplicant_Income': data['coapplicant_income'],
            'Employment_Status':  EMPLOYMENT_STATUS_MAP.get(data['employment_status'], 1),
            'Age':                data['age'],
            'Marital_Status':     MARITAL_STATUS_MAP.get(data['marital_status'], 0),
            'Dependents':         data['dependents'],
            'Credit_Score':       data['credit_score'],
            'Existing_Loans':     data['existing_loans'],
            'DTI_Ratio':          data['dti_ratio'],
            'Savings':            data['savings'],
            'Collateral_Value':   data['collateral_value'],
            'Loan_Amount':        data['loan_amount'],
            'Loan_Term':          data['loan_term'],
            'Loan_Purpose':       LOAN_PURPOSE_MAP.get(data['loan_purpose'], 0),
            'Property_Area':      PROPERTY_AREA_MAP.get(data['property_area'], 2),
            'Education_Level':    EDUCATION_LEVEL_MAP.get(data['education_level'], 0),
            'Gender':             GENDER_MAP.get(data['gender'], 1),
            'Employer_Category':  EMPLOYER_CATEGORY_MAP.get(data['employer_category'], 3),
        }

        # Build input array in correct column order
        input_arr = np.array([[encoded[col] for col in feature_columns]])
        input_scaled = scaler.transform(input_arr)

        # Predict
        prediction = model.predict(input_scaled)[0]
        proba = model.predict_proba(input_scaled)[0]
        confidence = float(max(proba))
        approved = bool(prediction == 1)

        # Explainability
        reasons, risks = generate_reasons(data, approved)

        return LoanPredictionResponse(
            prediction="Approved" if approved else "Rejected",
            approved=approved,
            confidence=round(confidence, 4),
            confidence_pct=f"{confidence * 100:.1f}%",
            reasons=reasons,
            risk_factors=risks,
            model_used=metadata.get("best_model", "Unknown"),
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
