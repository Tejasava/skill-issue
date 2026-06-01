# QUICK START - Deploy & Connect Frontend-Backend

## ⚡ TL;DR - 20 Minutes to Production

This is your **fastest path** to get frontend deployed and connected to backend.

---

## 📋 Pre-Flight Checklist (Do These First)

- [ ] Backend deployed on Render: `https://skill-issue-ihmm.onrender.com`
- [ ] Backend API working: `curl https://skill-issue-ihmm.onrender.com/api`
- [ ] GitHub repo updated: `https://github.com/Tejasava/skill-issue`
- [ ] Vercel account created: `https://vercel.com`

---

## 🚀 Deploy Frontend (5 minutes)

### Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Click "Add New" → "Project"

### Import Repository
- Click "Import Git Repository"
- Search: `skill-issue`
- Select it and click "Import"

### Configure Build
```
Build Command:       cd frontend && npm install && npm run build
Output Directory:    frontend/dist
Install Command:     npm install
```

### Add Environment Variable
```
Name:  VITE_API_URL
Value: https://skill-issue-ihmm.onrender.com
```

### Deploy
- Click "Deploy"
- Wait 2-5 minutes
- **Copy your Vercel URL** (looks like: `https://skill-issue-abc123.vercel.app`)

---

## 🔗 Connect Backend to Frontend (2 minutes)

### Go to Render Dashboard
```
https://dashboard.render.com
```

### Select Backend Service
- Click `skill-issue-backend`

### Update CLIENT_URL
1. Click "Environment" in sidebar
2. Find `CLIENT_URL` variable
3. Change value to: **your Vercel URL**
   - Example: `https://skill-issue-abc123.vercel.app`
4. Click "Save"
5. Wait 2-5 minutes for auto-redeploy

---

## ✅ Verify Everything Works (3 minutes)

### Test 1: Frontend Loads
```
Open in browser: https://your-vercel-url.vercel.app
Should see: Landing page (no 404 error)
```

### Test 2: Backend Responds
```
Open: DevTools (F12) → Console
Run:
  fetch('https://skill-issue-ihmm.onrender.com/api')
    .then(r => r.json())
    .then(d => console.log(d))
Should see: JSON response (no CORS error)
```

### Test 3: Login Works
```
1. Go to frontend login page
2. Try to login (use test account)
3. Should redirect to dashboard
4. Check DevTools Network tab
5. API calls should go to Render backend
```

---

## 🎉 Done! You're Live

- ✅ Frontend: `https://your-vercel-url.vercel.app`
- ✅ Backend: `https://skill-issue-ihmm.onrender.com`
- ✅ Connected and ready to use!

---

## 🐛 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS Error | Wait 5 min, then refresh. Check CLIENT_URL on Render is updated |
| 404 on Frontend | Check Vercel output directory is `frontend/dist` |
| API Fails | Test: `curl https://skill-issue-ihmm.onrender.com/api` |
| Still Broken? | See detailed guides below ↓ |

---

## 📚 Detailed Guides

- **Full Vercel Guide:** `VERCEL_FRONTEND_DEPLOYMENT.md`
- **Integration Testing:** `INTEGRATION_CHECKLIST.md`
- **Backend Issues:** `RENDER_DEPLOYMENT_GUIDE.md`
- **API Reference:** `API_DOCUMENTATION.md`

---

## 🔑 Important URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://your-vercel-url.vercel.app` |
| Backend (Render) | `https://skill-issue-ihmm.onrender.com` |
| GitHub | `https://github.com/Tejasava/skill-issue` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| Render Dashboard | `https://dashboard.render.com` |

---

## 🎯 What's Next?

1. Test all features (login, chat, exchanges, etc.)
2. Check performance in Vercel Analytics
3. Monitor Render logs for errors
4. Set up custom domain (optional)
5. Enable error tracking (optional)

---

**Total Time: ~20 minutes**  
**Difficulty: ⭐ (Easy)**  
**Success Rate: 95%+**

**Questions?** Check the detailed guides or GitHub issues.

---

**Ready? Start deploying now!** 🚀
