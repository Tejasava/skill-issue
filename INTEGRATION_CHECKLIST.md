# Frontend-Backend Integration Checklist

## Quick Setup (5 Steps)

### ✅ Step 1: Deploy Frontend on Vercel (5 min)
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Select `skill-issue` repository
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Output Directory: `frontend/dist`
- [ ] Add Environment Variable:
  - Name: `VITE_API_URL`
  - Value: `https://skill-issue-ihmm.onrender.com`
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-5 min)
- [ ] Note your Vercel URL: `https://your-project.vercel.app`

### ✅ Step 2: Update Render Environment Variable (2 min)
- [ ] Go to https://dashboard.render.com
- [ ] Select `skill-issue-backend` service
- [ ] Click "Environment" in sidebar
- [ ] Find `CLIENT_URL` environment variable
- [ ] Update value to: `https://your-project.vercel.app`
- [ ] Click "Save"
- [ ] Wait for auto-redeploy (2-5 min)

### ✅ Step 3: Test Frontend Loads (1 min)
- [ ] Open https://your-project.vercel.app in browser
- [ ] Should see landing page
- [ ] No 404 or error messages

### ✅ Step 4: Test API Connection (2 min)
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Run test:
  ```javascript
  fetch('https://skill-issue-ihmm.onrender.com/api')
    .then(r => r.json())
    .then(d => console.log(d))
  ```
- [ ] Should see JSON response (no CORS error)

### ✅ Step 5: Test Authentication (3 min)
- [ ] Navigate to login page on frontend
- [ ] Open Network tab in DevTools
- [ ] Try to login with test credentials
- [ ] Check network requests go to backend
- [ ] Should see 200 status (success) or 401 (incorrect credentials)
- [ ] No CORS errors

**Total Time: ~20 minutes**

---

## Detailed Integration Testing

### Frontend Tests
- [ ] **Page Load Test**
  - Open https://your-project.vercel.app
  - Should load in < 3 seconds
  - No console errors
  - All images load

- [ ] **Navigation Test**
  - Click all menu items
  - Routes work correctly
  - Pages load without errors

- [ ] **Responsive Design Test**
  - Test on mobile (DevTools)
  - Test on tablet
  - Test on desktop
  - All layouts work

### API Connection Tests

- [ ] **Health Check**
  ```bash
  curl https://skill-issue-ihmm.onrender.com/
  ```
  Response: `{ "status": "success", "message": "Backend is running" }`

- [ ] **API Status**
  ```bash
  curl https://skill-issue-ihmm.onrender.com/api
  ```
  Response: Available endpoints list

- [ ] **Get Users (No Auth)**
  ```bash
  curl https://skill-issue-ihmm.onrender.com/api/users
  ```
  Response: Users list

- [ ] **Register User (With Auth)**
  ```bash
  curl -X POST https://skill-issue-ihmm.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"test","email":"test@test.com","password":"pass123"}'
  ```
  Response: Token and user data

- [ ] **Login User (With Auth)**
  ```bash
  curl -X POST https://skill-issue-ihmm.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"pass123"}'
  ```
  Response: Token and user data

### Feature Tests

- [ ] **Authentication**
  - Register new user
  - Login with credentials
  - Token stored in localStorage
  - Protected pages redirect to login

- [ ] **User Profile**
  - View own profile
  - Edit profile
  - Upload avatar
  - Update skills

- [ ] **Skill Exchange**
  - View all exchanges
  - Create exchange (if authenticated)
  - Update exchange
  - Delete exchange

- [ ] **Chat/Messages**
  - Send message to another user
  - Receive message (real-time)
  - Message history loads
  - Typing indicator works

- [ ] **Events**
  - View all events
  - Create event (if authenticated)
  - Join event
  - View participants

- [ ] **Community**
  - View communities
  - Create post
  - Comment on post
  - View community members

- [ ] **Projects**
  - View projects
  - Create project (if authenticated)
  - Add team members
  - Upload project files

- [ ] **Friends**
  - View friends list
  - Send friend request
  - Accept/Reject request
  - View friend profiles

### Performance Tests

- [ ] **Page Load Performance**
  - Vercel DevTools → Analytics
  - Check average load time
  - Should be < 3 seconds

- [ ] **API Response Time**
  - Network tab in browser
  - API responses should be < 500ms
  - Check for slow requests

- [ ] **Database Performance**
  - Render Logs should not show timeouts
  - No 504 Gateway Timeout errors

### CORS & Security Tests

- [ ] **CORS Headers**
  - Network tab → Response Headers
  - Should include: `Access-Control-Allow-Origin`
  - Should include: `Access-Control-Allow-Methods`

- [ ] **Authentication Headers**
  - Protected routes require Authorization header
  - Invalid token returns 401
  - Valid token allows access

- [ ] **Helmet Security Headers**
  - Should include: `X-Frame-Options`
  - Should include: `X-Content-Type-Options`
  - Should include: `Content-Security-Policy`

### Error Handling Tests

- [ ] **Invalid Endpoint**
  - Visit: https://your-project.vercel.app/invalid
  - Should show 404 page

- [ ] **Invalid API Call**
  - Try: `/api/invalid`
  - Should return: `{ "status": "error", "message": "Route not found" }`

- [ ] **Server Error**
  - Try to create item with invalid data
  - Should return 400/422 with error message

- [ ] **Authentication Error**
  - Try protected route without token
  - Should redirect to login

### WebSocket Tests

- [ ] **Socket.IO Connection**
  ```javascript
  const socket = io('https://skill-issue-ihmm.onrender.com');
  socket.on('connect', () => console.log('Connected'));
  ```
  Should see: "Connected" in console

- [ ] **Real-time Messages**
  - Send message in chat
  - Receive it in real-time (not page refresh)
  - Typing indicators work

- [ ] **Multiple Connections**
  - Open two browser windows
  - Send message from one
  - Receive in other window (real-time)

### Environment Variable Tests

- [ ] **Verify Vercel Env Vars**
  - Go to Vercel Project Settings
  - Environment Variables section
  - Check: `VITE_API_URL` is set
  - Check: Value is correct Render URL

- [ ] **Verify Render Env Vars**
  - Go to Render Service Settings
  - Environment section
  - Check: `CLIENT_URL` is set
  - Check: Value is correct Vercel URL
  - Check: All other vars are set (MONGO_URI, JWT_SECRET, etc.)

---

## Troubleshooting Matrix

| Issue | Symptom | Solution |
|-------|---------|----------|
| CORS Error | "blocked by CORS policy" | Update CLIENT_URL on Render |
| 404 Page | "Cannot GET /" | Check Vercel build output directory |
| API 502 | Backend unreachable | Render service not running, check logs |
| Auth Fails | Login returns error | Check JWT_SECRET on Render |
| No WebSocket | Chat not real-time | Enable WebSocket on Render, check CORS |
| Image Upload Fails | 4xx error | Check Cloudinary credentials on Render |
| Slow Load | Pages take > 5s | Check Vercel analytics, optimize bundle |
| HTTPS Mixed Content | Console warnings | Ensure all URLs use HTTPS |

---

## Verification Checklist Summary

### Pre-Deployment
- [ ] Backend deployed on Render ✅
- [ ] Frontend code ready for production
- [ ] GitHub repository up to date
- [ ] Environment variables documented

### Deployment
- [ ] Frontend deployed on Vercel
- [ ] VITE_API_URL set on Vercel
- [ ] CLIENT_URL updated on Render
- [ ] Auto-redeploy triggered on Render

### Post-Deployment
- [ ] Frontend loads without 404
- [ ] API responds without CORS errors
- [ ] Authentication works
- [ ] Chat/WebSocket works
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] Error handling works

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Render Logs accessible
- [ ] Error tracking configured (optional)
- [ ] Performance alerts set (optional)

---

## Rollback Procedure

If anything goes wrong:

### Frontend Rollback (Vercel)
1. Go to https://vercel.com/dashboard
2. Select project
3. Go to "Deployments" tab
4. Find previous working deployment
5. Click "..." (three dots)
6. Click "Promote to Production"
7. Instant rollback ✅

### Backend Rollback (Render)
1. Go to https://dashboard.render.com
2. Select service
3. Go to "Deploys" tab
4. Find previous deployment
5. Click "Redeploy"
6. Service redeploys automatically ✅

---

## Support Resources

- **Vercel Issues:** https://vercel.com/support
- **Render Issues:** https://render.com/support
- **GitHub Issues:** https://github.com/Tejasava/skill-issue/issues
- **API Docs:** See `API_DOCUMENTATION.md`
- **Render Guide:** See `RENDER_DEPLOYMENT_GUIDE.md`

---

## Final Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend running on Render
- [ ] Connected and communicating
- [ ] All features working
- [ ] Ready for production use! 🎉

---

**Time to Complete:** 20-30 minutes
**Difficulty:** ⭐⭐ (Easy)
**Success Rate:** 95%+

**Questions?** Check the deployment guides or GitHub issues.
