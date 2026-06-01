# 🚀 Vercel Deployment Guide - Complete Steps

## Status: ✅ Ready for Vercel Deployment

Your project is now fully configured and pushed to GitHub. Follow these exact steps to deploy on Vercel.

---

## Step 1: Go to Vercel Dashboard

1. Open **https://vercel.com/dashboard**
2. Sign in with your GitHub account (if not already logged in)
3. Click **"Add New"** button
4. Select **"Project"**

---

## Step 2: Import Your GitHub Repository

1. Search for `skill-issue` repository
2. Click **"Import"**
3. You'll be taken to the configuration page

---

## Step 3: Configure Project Settings

### Project Name
- Name: `skill-issue` (or any name you prefer)
- Framework Preset: **Vite** (should auto-detect)

### Root Directory
- ✅ Already set to `frontend` in vercel.json

### Build Settings
The following should be **auto-filled** from vercel.json:
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm ci --legacy-peer-deps`

*If not auto-filled, manually enter these values*

---

## Step 4: Add Environment Variables

This is **CRITICAL** for frontend-backend connection:

### Adding Variables Method A (Simple):
1. Scroll to **"Environment Variables"** section
2. Click **"Add New"**
3. **Name**: `VITE_API_URL`
4. **Value**: `https://skill-issue-ihmm.onrender.com`
5. **Scope**: Select all (Production, Preview, Development)
6. ✅ Make sure the **toggle is ON** (blue/enabled)
7. Click **"Save"**

### Adding Variables Method B (If error persists):
1. Click **"Cancel"** or go back to Dashboard
2. Go to **Project Settings** → **Environment Variables**
3. Click **"Add New Environment Variable"**
4. Enter same values as above
5. Click **"Save"**

---

## Step 5: Deploy

1. Click the **"Deploy"** button
2. Wait for build to complete (3-5 minutes)
3. You'll see a success message with your Vercel URL
4. **Note your URL**: `https://your-project.vercel.app`

---

## Step 6: Verify Frontend Deployment

1. Open your Vercel URL in browser
2. ✅ You should see the landing page
3. ✅ No 404 errors
4. ✅ No CORS errors in console

**Test with this curl command:**
```bash
curl https://your-project.vercel.app
```

---

## Step 7: Update Render Backend (IMPORTANT!)

Your frontend is now deployed, but backend needs to know about it for CORS:

1. Go to **https://dashboard.render.com**
2. Find **`skill-issue-backend`** service
3. Click **"Environment"** in the sidebar
4. Find variable **`CLIENT_URL`**
5. Update value to: **`https://your-project.vercel.app`** (your actual Vercel URL)
6. Click **"Save"**
7. Wait 2-5 minutes for auto-redeploy

---

## Step 8: Test Full Integration

### Test 1: Backend Health Check
```bash
curl https://skill-issue-ihmm.onrender.com/api
```
Should return:
```json
{
  "status": "success",
  "message": "API is working",
  "availableEndpoints": { ... }
}
```

### Test 2: Frontend API Connection
1. Open your Vercel URL: `https://your-project.vercel.app`
2. Open DevTools (F12)
3. Go to **Console** tab
4. Run:
```javascript
fetch('/api').then(r => r.json()).then(console.log)
```
Should return API endpoints without CORS error

### Test 3: Login Test
1. Navigate to Login page
2. Open **Network** tab in DevTools
3. Try login with test credentials:
   - Email: `test@example.com`
   - Password: Any password
4. Check requests go to backend (status 401 is OK, means backend responded)
5. ✅ No CORS errors in Console

---

## 🎉 Success Indicators

- ✅ Frontend loads at Vercel URL
- ✅ No 404 errors
- ✅ Console has no CORS errors
- ✅ API health check responds
- ✅ Login attempts reach backend
- ✅ Real-time features work (chat, messages)

---

## ⚠️ Troubleshooting

### Issue: "Cannot GET /" on Vercel
**Solution**: 
- Check Output Directory is `frontend/dist`
- Verify Build Command includes `cd frontend`
- Try redeploying

### Issue: CORS errors in browser console
**Solution**:
- Update Render `CLIENT_URL` to your Vercel URL
- Wait 5 minutes for backend to redeploy
- Hard refresh browser (Cmd+Shift+R)

### Issue: Build fails on Vercel
**Solution**:
- Check build logs in Vercel dashboard
- Ensure `npm install` succeeds locally: `cd frontend && npm install`
- Check for TypeScript errors: `cd frontend && npm run build`

### Issue: API returns 404
**Solution**:
- Verify backend health: `curl https://skill-issue-ihmm.onrender.com/`
- Check `VITE_API_URL` is exactly: `https://skill-issue-ihmm.onrender.com`
- Restart backend in Render dashboard

### Issue: Environment variable not working
**Solution**:
- Delete the variable and add fresh
- Make sure **toggle is ON**
- Redeploy from Vercel dashboard
- Wait 2-3 minutes for changes to take effect

---

## 📋 Quick Checklist

- [ ] Vercel account created
- [ ] GitHub repo imported to Vercel
- [ ] Root Directory set to `frontend`
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Output Directory: `frontend/dist`
- [ ] VITE_API_URL: `https://skill-issue-ihmm.onrender.com`
- [ ] Environment variable toggle is **ON**
- [ ] Deploy button clicked
- [ ] Build completed successfully
- [ ] Frontend loads without 404
- [ ] Render CLIENT_URL updated to Vercel URL
- [ ] Render backend redeployed
- [ ] API health check responds
- [ ] No CORS errors in console
- [ ] Login works without errors

---

## 📚 Related Files

- **frontend/vite.config.ts** - Build configuration
- **frontend/package.json** - Dependencies and build scripts
- **vercel.json** - Vercel deployment configuration
- **.vercelignore** - Files to ignore during deployment

---

## 🔗 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Backend URL**: https://skill-issue-ihmm.onrender.com
- **Your Frontend URL**: https://your-project.vercel.app (will be set after deployment)

---

**Your project is ready! Follow the steps above to deploy on Vercel.** 🚀
