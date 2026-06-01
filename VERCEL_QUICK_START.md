# ⚡ Quick Vercel Deployment Checklist

## 📋 Pre-Deployment Check ✅
- [x] Frontend code is ready
- [x] Backend is deployed on Render ✅
- [x] GitHub repository is up-to-date
- [x] vercel.json is configured
- [x] .vercelignore is created
- [x] All files pushed to GitHub

---

## 🚀 Deployment Steps (9 Steps - 20 minutes)

### Step 1️⃣ | Dashboard (1 min)
```
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
```

### Step 2️⃣ | Import Repo (1 min)
```
1. Search for "skill-issue"
2. Click "Import"
```

### Step 3️⃣ | Verify Settings (1 min)
```
✓ Root Directory: frontend
✓ Build Command: cd frontend && npm install && npm run build
✓ Output Directory: frontend/dist
```

### Step 4️⃣ | Add Environment Variable (2 min)
```
Name: VITE_API_URL
Value: https://skill-issue-ihmm.onrender.com
Scope: Production, Preview, Development
⚠️  Toggle: ON (blue/enabled)
```

### Step 5️⃣ | Deploy (5 min)
```
1. Click "Deploy"
2. Wait for build to complete
3. See success message
```

### Step 6️⃣ | Note URL (1 min)
```
Your Frontend URL: https://your-project.vercel.app
(Copy this URL for next step)
```

### Step 7️⃣ | Update Render (2 min)
```
1. Go to https://dashboard.render.com
2. Select "skill-issue-backend"
3. Click "Environment"
4. Update CLIENT_URL = https://your-project.vercel.app
5. Click "Save"
6. Wait 2-5 minutes for redeploy
```

### Step 8️⃣ | Test Backend (1 min)
```bash
curl https://skill-issue-ihmm.onrender.com/api
# Should return: {"status": "success", "message": "API is working", ...}
```

### Step 9️⃣ | Test Frontend (5 min)
```
1. Open https://your-project.vercel.app
2. Open DevTools (F12)
3. Check Console (no red errors)
4. Try Login (should reach backend)
5. No CORS errors = ✅ Success!
```

---

## 🎯 Expected Outcomes

### ✅ Successful Frontend Deployment
- [ ] Frontend loads without 404
- [ ] Landing page displays correctly
- [ ] Console has no CORS errors
- [ ] Images load properly
- [ ] Navigation works

### ✅ Successful Backend Integration
- [ ] Backend responds to API calls
- [ ] Login attempts reach backend
- [ ] No CORS errors in browser
- [ ] Real-time features work
- [ ] File uploads work

---

## ⚠️ Common Issues & Quick Fixes

### Issue: "Cannot GET /" on Vercel
**Fix**: Verify output directory is `frontend/dist` and build command includes `cd frontend`

### Issue: CORS errors in console
**Fix**: Update Render CLIENT_URL and wait 5 minutes, then hard refresh (Cmd+Shift+R)

### Issue: Build fails
**Fix**: Run locally: `cd frontend && npm install && npm run build`

### Issue: Environment variable not working
**Fix**: Delete and re-add, make sure toggle is ON, wait 2-3 minutes

---

## 📚 Full Documentation
See `VERCEL_DEPLOYMENT_STEPS.md` for detailed troubleshooting guide

## 🔗 Links
- **GitHub**: https://github.com/Tejasava/skill-issue
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Backend**: https://skill-issue-ihmm.onrender.com

---

**Status**: ✅ Ready to Deploy
**Estimated Time**: 20 minutes
**Difficulty**: Easy
**Start**: https://vercel.com/dashboard

🎉 **Let's Deploy!**
