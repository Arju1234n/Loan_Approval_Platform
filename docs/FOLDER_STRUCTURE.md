# Folder Structure

```
loan-approval-platform/
│
├── .gitignore
├── package.json                         # Monorepo root — workspace scripts
├── README.md
│
├── frontend/                            # React + Vite — User Interface
│   ├── .env                             # Local env (git-ignored)
│   ├── .env.example                     # Template (committed)
│   ├── .gitignore
│   ├── index.html                       # App shell HTML
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                     # React entry point + AuthProvider
│       ├── App.jsx                      # Router + route guards
│       ├── index.css                    # Global CSS variables & reset
│       └── features/
│           ├── auth/
│           │   ├── hooks/
│           │   │   └── useAuth.jsx      # AuthContext + useAuth hook
│           │   └── pages/
│           │       ├── LoginPage.jsx
│           │       ├── RegisterPage.jsx
│           │       ├── ProfilePage.jsx
│           │       └── Auth.css / ProfilePage.css
│           ├── home/
│           │   └── pages/
│           │       ├── HomePage.jsx     # Dashboard with stat cards
│           │       └── HomePage.css
│           ├── loan/
│           │   └── pages/
│           │       ├── ApplyPage.jsx    # 4-section loan application form
│           │       ├── ResultPage.jsx   # AI decision + explainability
│           │       ├── HistoryPage.jsx  # Searchable application list
│           │       └── *.css
│           ├── admin/
│           │   └── pages/
│           │       ├── AdminDashboard.jsx  # Stats + override table
│           │       └── AdminDashboard.css
│           ├── analytics/
│           │   └── pages/
│           │       ├── AnalyticsPage.jsx   # 5 Recharts visualizations
│           │       └── AnalyticsPage.css
│           └── shared/
│               ├── components/
│               │   ├── AppShell.jsx     # Sidebar layout
│               │   └── AppShell.css
│               └── services/
│                   └── api.js           # Axios instance with JWT interceptor
│
├── backend/                             # Node.js / Express — REST API
│   ├── .env                             # Local env (git-ignored)
│   ├── .env.example                     # Template (committed)
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── server.js                    # MongoDB connect + HTTP listen
│       ├── app.js                       # Express setup, routes, middleware
│       ├── config/
│       │   └── db.js                    # Mongoose connection
│       ├── middleware/
│       │   ├── auth.js                  # protect + adminOnly JWT guards
│       │   └── validate.js             # express-validator error handler
│       ├── utils/
│       │   └── email.js                # Nodemailer + email templates
│       └── modules/
│           ├── auth/
│           │   ├── controller/  authController.js
│           │   ├── model/       User.js
│           │   ├── repository/  authRepository.js
│           │   ├── routes/      authRoutes.js
│           │   ├── service/     authService.js
│           │   └── validation/  authValidation.js
│           ├── loan/
│           │   ├── controller/  loanController.js
│           │   ├── model/       LoanApplication.js, PredictionResult.js
│           │   ├── repository/  loanRepository.js
│           │   ├── routes/      loanRoutes.js
│           │   ├── service/     loanService.js
│           │   └── validation/  loanValidation.js
│           ├── admin/
│           │   ├── controller/  adminController.js
│           │   ├── repository/  adminRepository.js
│           │   ├── routes/      adminRoutes.js
│           │   └── service/     adminService.js
│           ├── analytics/
│           │   ├── controller/  analyticsController.js
│           │   ├── routes/      analyticsRoutes.js
│           │   └── service/     analyticsService.js
│           └── notification/
│               ├── controller/  notificationController.js
│               ├── model/       EmailLog.js, AdminLog.js
│               ├── routes/      notificationRoutes.js
│               └── service/     notificationService.js
│
├── ml-service/                          # Python FastAPI — ML Microservice
│   ├── .env                             # Local env (git-ignored)
│   ├── .env.example                     # Template (committed)
│   ├── .gitignore
│   ├── requirements.txt
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py                      # FastAPI: GET /, /health, POST /predict
│   ├── training/
│   │   ├── __init__.py
│   │   └── train.py                     # Full training pipeline
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── preprocessing.py             # Shared data-cleaning functions
│   ├── prediction/
│   │   ├── __init__.py
│   │   └── predict.py                   # CLI batch predictor
│   ├── models/                          # Saved artifacts (git-ignored)
│   │   ├── loan_model.pkl
│   │   ├── scaler.pkl
│   │   ├── label_encoders.pkl
│   │   ├── feature_columns.pkl
│   │   └── model_metadata.json
│   └── dataset/
│       └── loan_data.csv                # CreditWise dataset
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── FOLDER_STRUCTURE.md              # This file
    └── PROJECT_WORKFLOW.md
```
