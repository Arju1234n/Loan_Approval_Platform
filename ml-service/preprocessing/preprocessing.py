"""
Preprocessing utilities for the CreditWise ML pipeline.

Centralises all data-cleaning logic so it can be reused
identically during both training and live inference.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder


CATEGORICAL_COLUMNS = [
    'Employment_Status', 'Marital_Status', 'Loan_Purpose',
    'Property_Area', 'Education_Level', 'Gender', 'Employer_Category',
]

NUMERIC_COLUMNS = [
    'Applicant_Income', 'Coapplicant_Income', 'Age', 'Dependents',
    'Credit_Score', 'Existing_Loans', 'DTI_Ratio', 'Savings',
    'Collateral_Value', 'Loan_Amount', 'Loan_Term',
]


def drop_id_column(df: pd.DataFrame) -> pd.DataFrame:
    """Remove Applicant_ID — identifier, not a feature."""
    return df.drop(columns=['Applicant_ID'], errors='ignore')


def fill_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Fill numeric NaNs with median, categoricals with mode."""
    df = df.copy()
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    for col in CATEGORICAL_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0])
    return df


def encode_categoricals(df: pd.DataFrame, encoders: dict | None = None):
    """
    Label-encode all categorical columns.

    Training mode  — pass encoders=None → fit new encoders and return them.
    Inference mode — pass the saved encoders dict → transform only.

    Returns (transformed_df, encoders_dict)
    """
    df = df.copy()
    fit_mode = encoders is None
    if fit_mode:
        encoders = {}

    for col in CATEGORICAL_COLUMNS:
        if col not in df.columns:
            continue
        if fit_mode:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
        else:
            le = encoders.get(col)
            if le is None:
                continue
            df[col] = df[col].astype(str).apply(
                lambda v: le.transform([v])[0]
                if v in le.classes_
                else -1
            )

    return df, encoders


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Drop exact duplicate rows."""
    return df.drop_duplicates()


def full_pipeline(df: pd.DataFrame, encoders: dict | None = None):
    """
    Run the complete preprocessing pipeline used during training.
    Returns (processed_df, encoders_dict).
    """
    df = drop_id_column(df)
    df = remove_duplicates(df)
    df = fill_missing_values(df)
    df, encoders = encode_categoricals(df, encoders)
    return df, encoders
