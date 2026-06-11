# Project Workflow

1. User signs up or logs in.
2. User completes the loan application form.
3. React sends the application payload to Express.
4. Express validates the request and calls the loan service.
5. Loan service calls FastAPI `/predict`.
6. FastAPI returns `Approved` or `Rejected`, confidence, and explainable reasons.
7. Express saves the loan application and prediction result in MongoDB.
8. Express sends an email notification and records the email log.
9. User sees the result page and can view history.
10. Admins review all applications, inspect analytics, and override decisions when needed.

## Explainable AI Rules

Approved decisions highlight positive factors such as high credit score, good savings, stable income, low DTI ratio, and low existing loans.

Rejected decisions expose risk factors such as low credit score, high DTI ratio, low savings, high existing loans, or low income.
