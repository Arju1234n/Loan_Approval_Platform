# Database Schema

## users

- `name`
- `email`
- `password`
- `role`
- `createdAt`
- `updatedAt`

## loan_applications

- `userId`
- `income`
- `coApplicantIncome`
- `employmentStatus`
- `age`
- `maritalStatus`
- `dependents`
- `creditScore`
- `existingLoans`
- `dtiRatio`
- `savings`
- `collateralValue`
- `loanAmount`
- `loanTerm`
- `loanPurpose`
- `propertyArea`
- `educationLevel`
- `gender`
- `employerCategory`
- `prediction`
- `confidence`
- `reasons`
- `riskFactors`
- `status`
- `adminOverride`
- `adminNote`
- `emailSent`
- `createdAt`
- `updatedAt`

## prediction_results

- `applicationId`
- `userId`
- `prediction`
- `confidence`
- `reasons`
- `riskFactors`
- `modelUsed`
- `rawResponse`
- `createdAt`
- `updatedAt`

## admin_logs

- `adminId`
- `action`
- `target`
- `targetId`
- `details`
- `createdAt`
- `updatedAt`

## email_logs

- `userId`
- `applicationId`
- `type`
- `to`
- `subject`
- `status`
- `error`
- `createdAt`
- `updatedAt`
