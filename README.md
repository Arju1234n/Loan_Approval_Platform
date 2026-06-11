# CreditWise — Smart Loan Approval Platform

> A full-stack, production-grade loan approval system with machine learning inference, role-based authentication, admin override controls, and real-time analytics.

---

## 🧭 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [ML Pipeline](#ml-pipeline)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Features](#features)
- [Credentials](#credentials)

---

## Overview

CreditWise is a three-service monorepo:

| Service | Technology | Port |
|---|---|---|
| **Frontend** | React 18 + Vite | 5173 |
| **Backend API** | Node.js + Express + MongoDB | 5000 |
| **ML Engine** | Python + FastAPI + scikit-learn | 8000 |

The backend receives loan applications, forwards them to the ML engine for prediction, stores results in MongoDB Atlas, and returns the decision to the user with confidence score and explainability factors.

---

## Tech Stack

### Frontend
- **React 18** + Vite
- **React Router v6** — client-side routing
- **Axios** — API calls with JWT interceptor
- **Lucide React** — icons
- **Recharts** — analytics charts
- **React Hot Toast** — notifications
- **Vanilla CSS** — dark glassmorphism design system

### Backend
- **Node.js** + **Express**
- **MongoDB Atlas** + **Mongoose**
- **JWT** — authentication & authorization
- **bcryptjs** — password hashing
- **express-validator** — input validation
- **Nodemailer** — email notifications

### ML Engine
- **FastAPI** — REST API
- **scikit-learn** — model training & inference
- **pandas** + **numpy** — data processing
- **joblib** — model serialization
- **Gaussian Naive Bayes** — production model (88.4% accuracy)

---

## ML Pipeline

Three models are trained and compared. The best F1 score winner is saved and deployed.

```
Dataset (1,000 samples, 18 features)
    │
    ▼
Step 1: Load & Analyse        → null values, dtypes, class distribution
Step 2: Clean Data            → median impute (numeric), mode impute (categorical)
Step 3: Feature Engineering   → LabelEncoder for 7 categorical columns
Step 4: Train/Test Split      → 80% train / 20% test
Step 5: Train 3 Models
    ├── Logistic Regression   → Accuracy: 87.4%  F1: 78.6%
    ├── KNN (k=5)             → Accuracy: 79.0%  F1: 64.3%
    └── Naive Bayes           → Accuracy: 88.4%  F1: 79.6%  ← WINNER
Step 6: Select Best (F1)      → Naive Bayes
Step 7: Save                  → loan_model.pkl, scaler.pkl, label_encoders.pkl
```

### Model Metrics

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---|---|---|---|
| **Naive Bayes** ✅ | **88.42%** | **89.58%** | **71.67%** | **79.63%** |
| Logistic Regression | 87.37% | 84.62% | 73.33% | 78.57% |
| KNN (k=5) | 78.95% | 69.23% | 60.00% | 64.29% |

### Input Features (18)

| Feature | Type |
|---|---|
| Applicant_Income | Numeric |
| Coapplicant_Income | Numeric |
| Age | Numeric |
| Dependents | Numeric |
| Credit_Score | Numeric |
| Existing_Loans | Numeric |
| DTI_Ratio | Numeric |
| Savings | Numeric |
| Collateral_Value | Numeric |
| Loan_Amount | Numeric |
| Loan_Term | Numeric |
| Employment_Status | Categorical |
| Marital_Status | Categorical |
| Loan_Purpose | Categorical |
| Property_Area | Categorical |
| Education_Level | Categorical |
| Gender | Categorical |
| Employer_Category | Categorical |

---

## Project Structure

```
Loan_Approval_Platform/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/           # Login, Register, Profile
│   │   │   ├── home/           # Dashboard with ML comparison
│   │   │   ├── loan/           # Apply, History, Result pages
│   │   │   ├── admin/          # Admin dashboard + override modal
│   │   │   ├── analytics/      # Recharts analytics page
│   │   │   └── shared/         # AppShell, API service
│   │   ├── index.css           # Design system (CSS variables, dark theme)
│   │   └── App.jsx             # Router + route guards
│   ├── .env                    # VITE_API_URL
│   └── vite.config.js          # Dev proxy → :5000
│
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT login, register, profile
│   │   │   ├── loan/           # Apply, history, result, admin override
│   │   │   └── analytics/      # Aggregation queries
│   │   ├── middleware/         # Auth guard, error handler
│   │   └── app.js             # Express setup + CORS
│   ├── seed.js                 # Seeds admin user into MongoDB
│   └── .env
│
└── ml-service/                 # FastAPI + scikit-learn
    ├── api/
    │   └── main.py             # /predict endpoint
    ├── models/
    │   ├── loan_model.pkl      # Trained Naive Bayes
    │   ├── scaler.pkl          # StandardScaler
    │   └── label_encoders.pkl  # LabelEncoders
    ├── training/
    │   ├── train.py            # Full training pipeline
    │   └── loan_data.csv       # 1,000 sample dataset
    └── requirements.txt
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.9 (Anaconda recommended)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/loan-approval-platform.git
cd loan-approval-platform

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Train the ML Model

```bash
cd ml-service
pip install -r requirements.txt
python training/train.py
```

This outputs `models/loan_model.pkl`, `scaler.pkl`, and `label_encoders.pkl`.

### 3. Seed Admin User

```bash
cd backend
node seed.js
```

### 4. Start All 3 Services

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — ML Engine:**
```bash
cd ml-service
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
# Runs on http://localhost:8000
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/creditwise
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### `frontend/.env`

```env
VITE_API_URL=/api
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login (returns JWT) |
| GET | `/api/auth/me` | JWT | Get current user |

### Loans
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/loans/apply` | JWT | Submit loan application |
| GET | `/api/loans/my-applications` | JWT | Get user's applications |
| GET | `/api/loans/:id` | JWT | Get single application |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Stats + recent users |
| GET | `/api/admin/applications` | Admin | All applications |
| PATCH | `/api/admin/applications/:id/override` | Admin | Override status |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | Admin | Full analytics data |

### ML Engine (FastAPI)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/predict` | Run ML inference |

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Set root dir = `frontend`, env: `VITE_API_URL` |
| Backend | **Render** | Set root dir = `backend`, start: `node src/server.js` |
| ML Engine | **Render** | Set root dir = `ml-service`, start: `uvicorn api.main:app --host 0.0.0.0 --port $PORT` |
| Database | **MongoDB Atlas** | Already hosted — copy URI to backend `.env` |

---

## Features

| Feature | Status |
|---|---|
| JWT Authentication (User + Admin) | ✅ |
| Separate User & Admin login portals | ✅ |
| Role-based route protection | ✅ |
| Loan application form (18 features) | ✅ |
| ML inference via FastAPI | ✅ |
| 3-model comparison (NB / LR / KNN) | ✅ |
| Confidence score + explainability | ✅ |
| Admin override with confirmation modal | ✅ |
| Analytics dashboard (5 Recharts) | ✅ |
| Indian Rupee (₹) formatting | ✅ |
| Dark glassmorphism UI | ✅ |
| Email notifications | ✅ |
| MongoDB Atlas persistence | ✅ |
| Responsive design | ✅ |

---

## Credentials

### User Login
```
URL:      http://localhost:5173/login
Email:    [EMAIL_ADDRESS]
Password: [PASSWORD]
```

### Admin Login
```
URL:      http://localhost:5173/admin/login
Email:    admin@creditwise.com
Password: Admin@123
```

---

## License

MIT © 2026 Arjun Kumar Gond
