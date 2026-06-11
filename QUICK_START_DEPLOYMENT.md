# Quick Start Deployment Guide

> Get your Loan Approval Platform deployed in 30 minutes

---

## 🚀 5-Minute Setup

### Step 1: Initialize Git Repository (2 min)

```bash
cd ~/Desktop/WEB\ DEVELOPMENT/Loan_Approval_Platform

# Initialize git
git init

# Add GitHub remote
git remote add origin https://github.com/<YOUR_USERNAME>/Loan_Approval_Platform.git
git branch -M main

# Add all files
git add .
git commit -m "🚀 Initial commit: CreditWise Loan Approval Platform"
git push -u origin main
```

### Step 2: Create GitHub Secrets (2 min)

Go to: **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Example |
|---|---|---|
| MONGODB_URI | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/creditwise` |
| JWT_SECRET | Secret key for JWT tokens | Generate: `openssl rand -base64 32` |
| EMAIL_USER | Gmail email address | `your-email@gmail.com` |
| EMAIL_PASS | Gmail App Password | Get from Gmail Security Settings |
| VERCEL_TOKEN | Vercel authentication token | Get from vercel.com/account/tokens |
| VERCEL_ORG_ID | Vercel organization ID | Found in Vercel dashboard |
| VERCEL_PROJECT_ID | Vercel project ID | Found in Vercel dashboard |
| RENDER_SERVICE_ID | Render service ID | Found in Render dashboard |
| RENDER_DEPLOY_KEY | Render deploy key | Found in Render settings |

### Step 3: Deploy Infrastructure (1 min each)

#### 🌐 Frontend - Vercel

```bash
# Option A: Web UI
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "frontend" as root directory
4. Add environment variables (if any)
5. Click "Deploy"

# Option B: CLI
npm install -g vercel
cd frontend
vercel
# Follow prompts
```

#### ⚙️ Backend - Render

```bash
# Option A: Web UI
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Configuration:
   - Name: creditwise-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Root Directory: backend
5. Add environment variables
6. Deploy

# Check deployment
curl https://<your-backend>.onrender.com/api/health
```

#### 🤖 ML Service - Railway

```bash
# Option A: Web UI
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select Loan_Approval_Platform
4. Add service → ml-service
5. Environment: Python
6. Deploy

# Test ML API
curl https://<your-ml>.railway.app/docs
```

#### 🗄️ Database - MongoDB Atlas

```bash
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account
3. Create a free cluster
4. Create database user
5. Get connection string
6. Whitelist your IP (or 0.0.0.0)
7. Use in MONGODB_URI secret
```

---

## ✅ Verification Checklist

After deployment, test each service:

```bash
# 1. Check Frontend
open https://creditwise.vercel.app
# Should load React app without errors

# 2. Check Backend Health
curl https://creditwise-backend.onrender.com/api/health
# Should return JSON with status: "healthy"

# 3. Check ML Service
curl https://creditwise-ml.railway.app/docs
# Should show FastAPI Swagger UI

# 4. Test End-to-End
# Submit a loan application on the frontend
# Should call backend → ML service → save to MongoDB → return result
```

---

## 📊 Monitoring

### GitHub Actions

Go to: **Actions → Deploy to Production**

```
✅ test-backend      → Backend tests pass
✅ test-frontend     → Frontend builds
✅ test-ml           → ML service loads
✅ deploy-frontend   → Deployed to Vercel
✅ deploy-backend    → Deployed to Render
✅ deploy-ml         → Deployed to Railway
```

### Vercel Dashboard

- **Deployments** → View all deployments
- **Logs** → Real-time logs
- **Monitoring** → Performance metrics

### Render Dashboard

- **Logs** → View service logs
- **Metrics** → CPU, memory usage
- **Events** → Deployment history

### Railway Dashboard

- **Logs** → ML service logs
- **Metrics** → Resource usage
- **Deployments** → History

### MongoDB Atlas

- **Clusters** → Database status
- **Monitoring** → Query performance
- **Backups** → Automated backups

---

## 🔧 Environment Variables

### Backend (.env)

```
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/creditwise

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=https://creditwise.vercel.app

# ML Service
ML_SERVICE_URL=https://creditwise-ml.railway.app

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```
VITE_API_URL=https://creditwise-backend.onrender.com/api
VITE_APP_NAME=CreditWise
VITE_APP_VERSION=1.0.0
```

### ML Service (.env)

```
PORT=8000
ENVIRONMENT=production
MODEL_PATH=./models/loan_model.pkl
LOG_LEVEL=info
```

---

## 🐛 Troubleshooting

### "Cannot find module" error

```bash
# Reinstall dependencies
cd backend && npm ci
cd ../frontend && npm ci
cd ../ml-service && pip install -r requirements.txt
```

### "Connection refused" on MongoDB

```bash
# Check MongoDB connection string
# Verify IP whitelist in MongoDB Atlas
# Test connection:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/creditwise"
```

### Frontend shows blank page

```bash
# Check browser console for errors (F12)
# Verify VITE_API_URL environment variable
# Check CORS settings on backend
```

### ML service not responding

```bash
# Check Python dependencies
cd ml-service
pip install -r requirements.txt

# Verify model files exist
ls models/loan_model.pkl

# Test locally
uvicorn api.main:app --reload
```

### GitHub Actions failing

```bash
# Check logs in Actions tab
# Verify all secrets are set
# Check Node/Python versions match
# Review error messages in workflow output
```

---

## 📚 Additional Resources

| Topic | Link |
|-------|------|
| Vercel Documentation | https://vercel.com/docs |
| Render Deployment | https://render.com/docs |
| Railway Platform | https://docs.railway.app |
| MongoDB Atlas | https://docs.atlas.mongodb.com |
| Express.js | https://expressjs.com |
| FastAPI | https://fastapi.tiangolo.com |
| React Documentation | https://react.dev |

---

## 🎯 Success Criteria

You've successfully deployed when:

- ✅ Frontend loads without errors
- ✅ Login/registration works
- ✅ Loan application submission works
- ✅ ML predictions are returned with confidence scores
- ✅ Admin dashboard shows applications
- ✅ Email notifications are sent
- ✅ Analytics dashboard displays data
- ✅ Database contains all application data

---

## 🚀 Next Steps

1. **Configure Custom Domain**
   - Vercel: Add domain in Settings
   - Render: Add custom domain
   - Update FRONTEND_URL in backend env vars

2. **Set Up SSL/HTTPS**
   - Vercel: Automatic
   - Render: Automatic
   - Railway: Automatic

3. **Enable Monitoring**
   - Set up Sentry for error tracking
   - Configure CloudWatch/DataDog
   - Enable GitHub notifications

4. **Performance Optimization**
   - Enable caching
   - Optimize database queries
   - Use CDN for static assets

5. **Security Hardening**
   - Enable 2FA on GitHub
   - Set up branch protection rules
   - Enable security scanning

---

## 💡 Pro Tips

```bash
# Monitor all three services in real-time
# Terminal 1: Backend logs
render logs --service-id=<backend-id>

# Terminal 2: Frontend logs
vercel logs

# Terminal 3: ML logs
railway logs

# Watch GitHub Actions
open https://github.com/<username>/Loan_Approval_Platform/actions
```

---

## Support

**Common Issues?**
- Check GitHub Issues: https://github.com/<username>/Loan_Approval_Platform/issues
- Review logs in service dashboards
- Read deployment documentation links above

**Need Help?**
- Platform-specific support:
  - Vercel: support@vercel.com
  - Render: support@render.com
  - Railway: team@railway.app
  - MongoDB: support@mongodb.com

---

*Status: ✅ Ready for Production Deployment*
*Last Updated: June 11, 2026*
