# Vercel Frontend Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:
- ✅ Render backend deployed: `https://skill-issue-ihmm.onrender.com`
- ✅ GitHub repository connected: `https://github.com/Tejasava/skill-issue`
- ✅ Vercel account: `https://vercel.com`
- ✅ GitHub account with push access

---

## Step 1: Verify Frontend Configuration

Your frontend is already configured for production deployment.

### API Configuration Status
✅ **File:** `frontend/src/lib/api.ts`
- Uses relative URLs `/api` (works with both proxy and production)
- Will automatically connect to backend via environment variable

✅ **File:** `frontend/vite.config.ts`
- Build tool: Vite (optimized for production)
- Supports environment variables
- Proper alias configuration

---

## Step 2: Deploy Frontend on Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Click "Import Git Repository"
   - Search and select `skill-issue`
   - Click "Import"

3. **Configure Project**
   - **Project Name:** `skill-issue` (or your preference)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Leave empty (or select `.`)

4. **Build & Output Settings**
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`

5. **Environment Variables**
   - Add environment variable:
     - **Name:** `VITE_API_URL`
     - **Value:** `https://skill-issue-ihmm.onrender.com`
   - Click "Add"

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your frontend will be at: `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to root directory
cd /Users/tejasavayadav/Desktop/Skill\ Issue/skill-sync-hub-main

# Deploy
vercel

# Follow prompts:
# - Link to existing project? (choose your project or create new)
# - Build settings? (confirm suggested)
# - Deploy? (yes)

# Set environment variable
vercel env add VITE_API_URL
# Enter value: https://skill-issue-ihmm.onrender.com
```

---

## Step 3: Configure Backend Connection

After frontend is deployed, update environment variables:

### In Vercel Dashboard:

1. **Navigate to your project**
   - Go to: https://vercel.com/dashboard/projects
   - Click your `skill-issue` project

2. **Go to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" (left sidebar)

3. **Add/Update Variables**
   ```
   VITE_API_URL = https://skill-issue-ihmm.onrender.com
   VITE_SOCKET_URL = https://skill-issue-ihmm.onrender.com
   ```

4. **Redeploy**
   - Click "Deployments" tab
   - Click the three dots on latest deployment
   - Click "Redeploy"

---

## Step 4: Update Backend CORS Settings

Your Render backend needs to accept requests from your Vercel frontend.

### Update Environment Variable on Render:

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Select Your Backend Service**
   - Click `skill-issue-backend`

3. **Update Environment Variables**
   - Click "Environment" in sidebar
   - Find `CLIENT_URL`
   - Update to your Vercel frontend URL
   - Example: `https://your-project.vercel.app`
   - Click "Save"

4. **Auto-Redeploy**
   - Service will auto-redeploy with new environment
   - Wait 2-5 minutes for deployment

### Backend Configuration in server.js:
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/,
      process.env.CLIENT_URL  // Your Vercel URL here
    ];
    
    if (!origin || allowedPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      }
      return pattern.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 3600
}));
```

---

## Step 5: Verify Deployment

### Test 1: Frontend Loads
```bash
# Open in browser
https://your-project.vercel.app

# Should see your landing page
```

### Test 2: API Connection
```bash
# Open DevTools (F12)
# Go to Console tab
# Paste:

fetch('https://your-project.vercel.app/api')
  .then(r => r.json())
  .then(d => console.log(d))

# Should see API response without CORS errors
```

### Test 3: Login/Auth
1. Navigate to login page
2. Try to login or register
3. Check Network tab in DevTools
4. Should see requests to `https://skill-issue-ihmm.onrender.com/api/auth/*`
5. Status should be 200/201, not 4xx/5xx

### Test 4: WebSocket Connection
```bash
# Open DevTools Console
# Paste:

const socket = new WebSocket('wss://skill-issue-ihmm.onrender.com');
socket.onopen = () => console.log('WebSocket connected');
socket.onerror = (e) => console.error('WebSocket error', e);

# Should see "WebSocket connected"
```

### Test 5: Check All Features
- ✅ Load frontend
- ✅ Navigate pages
- ✅ Login/Register
- ✅ Create exchanges
- ✅ Send messages (chat)
- ✅ Create projects
- ✅ Join communities
- ✅ View events

---

## Troubleshooting

### Issue: CORS Error on Frontend

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Check `CLIENT_URL` on Render matches your Vercel URL
2. Wait 2-5 minutes for Render to redeploy
3. Check CORS headers in browser Network tab
4. Verify `VITE_API_URL` is set in Vercel

### Issue: "Cannot GET /" on Frontend

**Symptom:**
- Browser shows "Cannot GET /"
- 404 error

**Solutions:**
1. Vercel didn't build correctly
   - Check Deployment logs in Vercel dashboard
   - Verify build command: `cd frontend && npm install && npm run build`
   
2. Output directory wrong
   - Should be: `frontend/dist`
   - Check in project settings

3. Redeploy
   - Click Deployments → Three dots → Redeploy

### Issue: API Requests Fail (4xx/5xx)

**Symptom:**
- Login fails
- Network tab shows red requests
- Status: 400, 401, 500, etc.

**Solutions:**
1. Check Render backend is running
   - Visit: `https://skill-issue-ihmm.onrender.com/api`
   - Should return JSON

2. Check environment variables
   - Verify `MONGO_URI` is correct on Render
   - Verify JWT_SECRET is set
   - Verify CLOUDINARY credentials are valid

3. Check logs
   - Render Dashboard → Select service → Logs
   - Look for error messages

### Issue: WebSocket Not Connecting

**Symptom:**
- Chat not working
- Console error: "WebSocket connection failed"

**Solutions:**
1. Check Socket.IO CORS in backend
2. Verify `CLIENT_URL` on Render is updated
3. Check if Render plan supports WebSocket (it does by default)
4. Try: `socket.disconnect()` then reconnect

### Issue: Images Not Loading

**Symptom:**
- User avatars show 404
- File uploads broken

**Solutions:**
1. Verify Cloudinary credentials on Render
2. Check upload middleware configuration
3. Test image upload in Vercel
4. Check browser console for failed requests

---

## Environment Variables Checklist

### On Vercel (Frontend):
```
VITE_API_URL = https://skill-issue-ihmm.onrender.com
VITE_SOCKET_URL = https://skill-issue-ihmm.onrender.com  (optional)
```

### On Render (Backend):
```
NODE_ENV = production
PORT = 3000
MONGO_URI = mongodb+srv://...
JWT_SECRET = your_secret_key
CLOUDINARY_CLOUD_NAME = your_cloud
CLOUDINARY_API_KEY = your_key
CLOUDINARY_API_SECRET = your_secret
CLIENT_URL = https://your-project.vercel.app
ADMIN_ID = admin
ADMIN_PASSWORD = password
```

---

## Performance Optimization

### Frontend (Vercel):
- ✅ Automatic CDN caching
- ✅ Edge caching enabled by default
- ✅ Automatic image optimization
- ✅ Serverless functions ready

### Backend (Render):
- ✅ Auto-scaling available
- ✅ Background jobs supported
- ✅ Persistent volumes available

---

## Monitoring & Logging

### Vercel:
- Dashboard → Analytics (page load times, errors)
- Deployments → Logs (build and runtime logs)

### Render:
- Dashboard → Logs (backend requests and errors)
- Metrics (CPU, Memory, Network)

---

## Rollback Strategy

### If Something Goes Wrong:

**Frontend (Vercel):**
1. Go to Deployments
2. Click on previous working deployment
3. Click "Promote to Production"
4. Instant rollback

**Backend (Render):**
1. Go to Deploys
2. Click on previous version
3. Click "Redeploy"
4. Auto-rolls back

---

## Common Next Steps

1. ✅ Enable custom domain (optional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain

2. ✅ Set up monitoring alerts
   - Vercel Analytics
   - Render Alerts

3. ✅ Enable error tracking
   - Sentry integration (optional)
   - LogRocket (optional)

4. ✅ Set up auto-deployments
   - Vercel: Auto-deploy on GitHub push (default)
   - Render: Auto-deploy on GitHub push (configured)

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **CORS Guide:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Vite Guide:** https://vitejs.dev/guide/

---

## Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| Backend | https://skill-issue-ihmm.onrender.com | ✅ Deployed |
| Frontend | https://your-project.vercel.app | 🔄 Deploying |
| GitHub | https://github.com/Tejasava/skill-issue | ✅ Connected |
| API Docs | See API_DOCUMENTATION.md | ✅ Available |

---

**Next Action:** Follow "Step 1-5" above to deploy on Vercel and connect both services!

**Estimated Time:** 15-20 minutes total deployment time
