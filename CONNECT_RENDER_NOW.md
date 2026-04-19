# Connect Your Render Backend - Action Steps

## Your Render Service ID: srv-d7i7egsvirkc73ectgjg

---

## STEP 1: Find Your Exact Backend URL

Go to: https://dashboard.render.com
- Click on your service
- Look at the top - you'll see a URL like:
  - `https://mits-attendance-backend.onrender.com`  (if you named it that)
  - OR `https://srv-d7i7egsvirkc73ectgjg.onrender.com`

Copy that URL.

---

## STEP 2: Test Your Backend is Live

Open browser and go to:
```
https://YOUR-RENDER-URL.onrender.com/api/health
```

You should see:
```json
{ "status": "OK", "message": "MITS Attendance System API is running" }
```

If you see this → Backend is working! ✅

---

## STEP 3: Update frontend/.env.production

Open file: `frontend/.env.production`
Replace with your actual Render URL:
```
REACT_APP_API_URL=https://YOUR-ACTUAL-RENDER-URL.onrender.com
```

---

## STEP 4: Set Environment Variables on Render

Go to Render Dashboard → Your Service → Environment tab
Add these variables:

| Key | Value |
|-----|-------|
| JWT_SECRET | mits2026_ajaymeena_secretkey_strong |
| NODE_ENV | production |
| QR_EXPIRY_SECONDS | 8 |

Click "Save Changes"

---

## STEP 5: Push Updated Code to GitHub

```bash
git add .
git commit -m "Connect to Render backend"
git push origin main
```

Render will auto-redeploy with new settings.

---

## STEP 6: Deploy Frontend on Vercel

1. Go to https://vercel.com
2. New Project → Import your GitHub repo
3. Root Directory: `frontend`
4. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://YOUR-RENDER-URL.onrender.com`
5. Deploy!

---

## STEP 7: Update CORS on Render

After Vercel gives you a URL (like `https://mits-attendance.vercel.app`):

Go to Render → Environment → Add:
```
FRONTEND_URL = https://mits-attendance.vercel.app
```

---

## Quick Test After Deployment

1. Open your Vercel URL
2. Login: `admin@college.edu` / `admin123`
3. If dashboard loads → Everything works! ✅

---

## ⚠️ Important: Free Render Limitation

Free Render services **sleep after 15 minutes** of no traffic.
First request after sleep takes **30-60 seconds** to wake up.

**Fix (Free):** Use UptimeRobot to ping every 14 minutes:
1. Go to https://uptimerobot.com (free)
2. Add monitor: `https://YOUR-RENDER-URL.onrender.com/api/health`
3. Set interval: 14 minutes
4. Your backend stays awake 24/7!

---

## Files Updated in This Session:

- `frontend/src/context/AuthContext.js` - Added Render URL as base URL
- `frontend/.env.production` - Production API URL
- `frontend/.env.development` - Local development URL
- `frontend/src/setupProxy.js` - Smart proxy (local only)
- `backend/server-simple.js` - Updated CORS for all domains

---

## Your URLs Summary:

| Service | URL |
|---------|-----|
| Backend (Render) | `https://srv-d7i7egsvirkc73ectgjg.onrender.com` |
| Frontend (Vercel) | *(after Vercel deployment)* |
| Health Check | `https://srv-d7i7egsvirkc73ectgjg.onrender.com/api/health` |
| Login Test | `https://srv-d7i7egsvirkc73ectgjg.onrender.com/api/auth/login` |
