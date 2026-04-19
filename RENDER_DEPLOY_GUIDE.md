# Deploy Backend to Render - Step by Step Guide

## Prerequisites
- GitHub account
- Render account (free at render.com)
- Your project pushed to GitHub

---

## STEP 1: Push Code to GitHub

### 1.1 Create GitHub Repository
1. Go to https://github.com
2. Click "New repository" (green button)
3. Name it: `mits-attendance-system`
4. Set to Public
5. Click "Create repository"

### 1.2 Push Your Code
Open terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - MITS Attendance System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mits-attendance-system.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username

---

## STEP 2: Deploy Backend on Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### 2.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if not already
4. Find and select your `mits-attendance-system` repository
5. Click **"Connect"**

### 2.3 Configure the Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `mits-attendance-backend` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node backend/server-simple.js` |
| **Instance Type** | `Free` |

### 2.4 Add Environment Variables
Click **"Advanced"** then **"Add Environment Variable"**

Add these one by one:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `JWT_SECRET` | `mits2026secretkey_ajaymeena_strong` |
| `NODE_ENV` | `production` |
| `QR_EXPIRY_SECONDS` | `8` |
| `FRONTEND_URL` | *(add after frontend is deployed)* |

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll see logs showing build progress
4. When you see `Server running on port 5000` - it's live!

### 2.6 Get Your Backend URL
After deployment, Render gives you a URL like:
```
https://mits-attendance-backend.onrender.com
```
**Save this URL - you'll need it for the frontend!**

---

## STEP 3: Test Your Backend

Open your browser and visit:
```
https://mits-attendance-backend.onrender.com/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "MITS Attendance System API is running"
}
```

Also test login:
```
https://mits-attendance-backend.onrender.com/api/auth/login
```

---

## STEP 4: Deploy Frontend on Vercel

### 4.1 Update Frontend API URL
Before deploying frontend, update the proxy in `frontend/src/setupProxy.js`:

The frontend needs to know your Render backend URL.

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://mits-attendance-backend.onrender.com
```

### 4.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your `mits-attendance-system` repo
5. Set **Root Directory** to `frontend`
6. Add environment variable:
   - `REACT_APP_API_URL` = `https://mits-attendance-backend.onrender.com`
7. Click "Deploy"

### 4.3 Get Frontend URL
After deployment:
```
https://mits-attendance-system.vercel.app
```

### 4.4 Update Backend CORS
Go back to Render → Your service → Environment
Add/update:
```
FRONTEND_URL = https://mits-attendance-system.vercel.app
```
Click "Save Changes" - Render will redeploy automatically.

---

## STEP 5: Final Testing

Test the complete system:
1. Open: `https://mits-attendance-system.vercel.app`
2. Login as admin: `admin@college.edu` / `admin123`
3. Login as teacher: `teacher@college.edu` / `teacher123`
4. Login as student: `student@college.edu` / `student123`
5. Test QR code generation and scanning

---

## Common Issues & Fixes

### Issue 1: "Build failed"
**Fix:** Check that `package.json` has correct start script:
```json
"start": "node backend/server-simple.js"
```

### Issue 2: "Cannot find module"
**Fix:** Make sure all dependencies are in `package.json` dependencies (not devDependencies)

### Issue 3: "CORS error" on frontend
**Fix:** Add your Vercel URL to FRONTEND_URL environment variable on Render

### Issue 4: "Service sleeps after 15 minutes" (Free tier)
**Fix:** Free Render services sleep after inactivity. First request after sleep takes ~30 seconds.
- Upgrade to paid plan ($7/month) for always-on
- Or use UptimeRobot (free) to ping every 14 minutes

### Issue 5: "Environment variables not working"
**Fix:** Never commit `.env` file. Always set variables in Render dashboard.

---

## Free Tier Limitations

| Feature | Free Tier |
|---------|-----------|
| Bandwidth | 100 GB/month |
| Build minutes | 500/month |
| Sleep after inactivity | 15 minutes |
| Custom domain | ✅ Yes |
| HTTPS | ✅ Yes (automatic) |
| Uptime | ~90% |

---

## Quick Commands Reference

### Push updates to GitHub (auto-deploys to Render):
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```
Render automatically redeploys when you push to GitHub!

### Check Render logs:
- Go to Render dashboard
- Click your service
- Click "Logs" tab
- See real-time logs

---

## Your Deployment URLs

After completing all steps:

| Service | URL |
|---------|-----|
| **Backend (Render)** | `https://mits-attendance-backend.onrender.com` |
| **Frontend (Vercel)** | `https://mits-attendance-system.vercel.app` |
| **API Health Check** | `https://mits-attendance-backend.onrender.com/api/health` |

---

## Summary of Steps

1. ✅ Push code to GitHub
2. ✅ Create Render account
3. ✅ Create Web Service on Render
4. ✅ Set environment variables
5. ✅ Deploy and get backend URL
6. ✅ Deploy frontend on Vercel
7. ✅ Update CORS with frontend URL
8. ✅ Test everything

---

## Need Help?

If deployment fails, check:
1. Render logs for error messages
2. Make sure `package.json` start script is correct
3. All environment variables are set
4. No syntax errors in code

**Developer:** Ajay Meena
**Institution:** Madhav Institute of Technology & Science
