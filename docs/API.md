# API Documentation

Base URL: `http://localhost:5001/api`

## Auth

`POST /auth/register`

```json
{ "name": "Aarav", "email": "aarav@example.com", "password": "secret123", "role": "user" }
```

`POST /auth/login`

```json
{ "email": "aarav@example.com", "password": "secret123" }
```

`GET /auth/me`

Requires `Authorization: Bearer <token>`.

`POST /auth/logout`

Client-side token removal plus confirmation response.

## Loans

`POST /loans/apply`

```json
{
  "income": 15000,
  "coApplicantIncome": 5000,
  "employmentStatus": "Salaried",
  "age": 34,
  "maritalStatus": "Married",
  "dependents": 1,
  "creditScore": 735,
  "existingLoans": 1,
  "dtiRatio": 0.28,
  "savings": 18000,
  "collateralValue": 40000,
  "loanAmount": 22000,
  "loanTerm": 48,
  "loanPurpose": "Home",
  "propertyArea": "Urban",
  "educationLevel": "Graduate",
  "gender": "Male",
  "employerCategory": "Private"
}
```

Response includes saved application, prediction, confidence, status, and reasons.

`GET /loans/my-applications`

Returns authenticated user's history.

`GET /loans/:id`

Returns one application if owned by the user or requested by an admin.

## Admin

All admin routes require an admin JWT.

`GET /admin/dashboard`

Returns summary cards, recent applications, users, and decision logs.

`GET /admin/applications?status=approved&prediction=Approved&search=home`

Returns filtered applications.

`GET /admin/users?search=aarav`

Returns filtered users.

`PATCH /admin/applications/:id/override`

```json
{ "status": "approved", "adminNote": "Manual underwriting override." }
```

## Analytics

`GET /analytics`

Returns total applications, approved/rejected counts, approval rate, average loan amount, average credit score, monthly trends, approval trends, loan amount distribution, and credit score distribution.

## Notifications

`GET /notifications/email-logs`

Admin-only list of notification attempts.

## ML Engine

Base URL: `http://localhost:8000`

- `GET /`
- `GET /health`
- `POST /predict`

The ML request uses snake_case versions of the same application fields.
