# Render Backend Deployment - Troubleshooting Guide

## Issue: "Cannot GET /api"

### Root Cause Analysis

This error occurs when:
1. ❌ **No route handler** is registered for the requested path
2. ❌ **Express server is not running** or failed to start
3. ❌ **Routes are not properly mounted**
4. ⚠️ **It's a NORMAL behavior** when accessing `/api` without a specific endpoint

### Solution Summary

The backend has been updated with **health-check endpoints**:

- `GET /` → Returns: `{ "status": "success", "message": "Backend is running" }`
- `GET /api` → Returns: `{ "status": "success", "message": "API is working", "availableEndpoints": {...} }`

All actual API endpoints are nested under specific paths:
- `GET /api/users` → Get all users
- `POST /api/auth/login` → Login user
- `GET /api/exchanges` → Get exchanges
- etc.

---

## Deployment Checklist for Render

### ✅ Step 1: Verify Server Configuration

Check that `server.js` contains:

```javascript
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});
```

**Status:** ✓ VERIFIED

---

### ✅ Step 2: Verify Health-Check Routes

Your `server.js` now includes:

```javascript
// GET /
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running'
  });
});

// GET /api
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working',
    availableEndpoints: { ... }
  });
});
```

**Status:** ✓ VERIFIED

---

### ✅ Step 3: Environment Variables on Render

Make sure these are set in Render Dashboard:

| Variable | Value | Example |
|----------|-------|---------|
| `PORT` | 3000 or 5000 | `3000` |
| `NODE_ENV` | production | `production` |
| `MONGO_URI` | MongoDB Atlas connection | `mongodb+srv://...` |
| `JWT_SECRET` | Random 32+ char string | `your_secret_key_here` |
| `CLIENT_URL` | Your Vercel frontend URL | `https://yourdomain.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | `ydxyrrnmca` |
| `CLOUDINARY_API_KEY` | Your API key | `997589635322515` |
| `CLOUDINARY_API_SECRET` | Your API secret | `K0IUEtG9htnjLyFD5J8ytwt-gyU` |
| `ADMIN_ID` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `strong_password` |

---

### ✅ Step 4: Build & Start Commands

On Render, verify these settings:

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

---

### ✅ Step 5: Test Health Endpoints

#### Test 1: Root Endpoint
```bash
curl https://skill-issue-ihmm.onrender.com/
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Backend is running",
  "timestamp": "2026-06-01T10:00:00.000Z",
  "environment": "production"
}
```

#### Test 2: API Endpoint
```bash
curl https://skill-issue-ihmm.onrender.com/api
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "API is working",
  "timestamp": "2026-06-01T10:00:00.000Z",
  "availableEndpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "exchanges": "/api/exchanges",
    "chat": "/api/chat",
    "friends": "/api/friends",
    "events": "/api/events",
    "admin": "/api/admin",
    "communities": "/api/communities",
    "projects": "/api/projects"
  }
}
```

#### Test 3: Actual API Endpoint
```bash
curl https://skill-issue-ihmm.onrender.com/api/users
```

**Expected Response:**
```json
{
  "status": "success",
  "users": [...]
}
```

---

## Common Issues & Solutions

### Issue 1: Server Won't Start

**Symptoms:**
- "Build failed" on Render
- Service keeps restarting
- "Cannot GET /" returns 502 Bad Gateway

**Solutions:**

1. **Check MongoDB Connection:**
   ```bash
   # Verify MONGO_URI is correct
   # Test connection in MongoDB Atlas
   ```

2. **Check Dependencies:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Check Port Configuration:**
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```
   Render assigns a random PORT - make sure you're using `process.env.PORT`

4. **Check Logs on Render:**
   - Go to Render Dashboard
   - Select your service
   - Check "Logs" tab for errors

---

### Issue 2: "Cannot GET /api"

**Symptoms:**
- Visit `https://your-service.onrender.com/api`
- Browser shows: "Cannot GET /api"

**Explanation:**
This was the **expected behavior before the fix** because there was no route handler for `/api`.

**Solution:**
The fix has been applied - now `/api` returns a proper JSON response.

---

### Issue 3: CORS Errors

**Symptoms:**
- Frontend receives CORS errors
- WebSocket connection fails

**Solutions:**

1. **Verify CORS Configuration:**
   ```javascript
   app.use(cors({
     origin: function (origin, callback) {
       const allowedPatterns = [
         /^http:\/\/localhost(:\d+)?$/,
         process.env.CLIENT_URL
       ];
       // ... validation logic
     }
   }));
   ```

2. **Update CLIENT_URL in Render:**
   - Set `CLIENT_URL` to your Vercel frontend URL
   - Example: `https://your-app.vercel.app`

3. **Check Socket.IO CORS:**
   ```javascript
   const io = require('socket.io')(server, {
     cors: {
       origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
       credentials: true
     }
   });
   ```

---

### Issue 4: Database Connection Failed

**Symptoms:**
- "Cannot connect to MongoDB"
- "MongoError: connect ECONNREFUSED"

**Solutions:**

1. **Verify MongoDB URI:**
   ```javascript
   // Format should be:
   // mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

2. **Check IP Whitelist in MongoDB Atlas:**
   - Go to MongoDB Atlas
   - Security → Network Access
   - Add Render's IP or `0.0.0.0/0` for all IPs

3. **Test Connection Locally:**
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(err => console.error(err))"
   ```

---

### Issue 5: WebSocket Connection Failed

**Symptoms:**
- Socket.IO connection fails
- Chat not working
- "WebSocket connection failed"

**Solutions:**

1. **Enable WebSocket on Render:**
   - Most Render plans support WebSocket
   - Check if your plan includes WebSocket

2. **Verify Socket.IO Configuration:**
   ```javascript
   const io = require('socket.io')(server, {
     cors: {
       origin: process.env.CLIENT_URL,
       methods: ['GET', 'POST'],
       credentials: true
     }
   });
   ```

3. **Check Frontend Connection:**
   ```javascript
   const socket = io('https://your-backend-url.onrender.com');
   socket.on('connect', () => console.log('Connected'));
   socket.on('connect_error', (error) => console.error(error));
   ```

---

## Performance Optimization

### 1. Enable Gzip Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Optimize Database Queries
- Add indexes to frequently queried fields
- Use `.lean()` for read-only queries
- Implement pagination for large datasets

### 3. Monitor Resource Usage
- Check Render dashboard for CPU/Memory usage
- Consider upgrading plan if needed

### 4. Enable Caching
```javascript
app.set('view cache', true);
// Implement Redis for session caching
```

---

## Security Checklist

- ✓ CORS is configured correctly
- ✓ JWT secrets are strong (32+ characters)
- ✓ Helmet is enabled for security headers
- ✓ Rate limiting is active (100 requests per 15 minutes)
- ✓ Passwords are hashed with bcryptjs
- ✓ Environment variables don't contain sensitive data in code
- ✓ HTTPS is enforced (Render provides this by default)
- ✓ SQL Injection prevented (using MongoDB with Mongoose)
- ✓ XSS prevention with helmet CSP headers

---

## Testing Production API

### Using Postman

1. Create new request
2. Method: GET
3. URL: `https://skill-issue-ihmm.onrender.com/api`
4. Send

### Using cURL

```bash
# Health check
curl https://skill-issue-ihmm.onrender.com/

# API check
curl https://skill-issue-ihmm.onrender.com/api

# Get all users
curl https://skill-issue-ihmm.onrender.com/api/users

# Login
curl -X POST https://skill-issue-ihmm.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Console tab
3. Paste:
```javascript
fetch('https://skill-issue-ihmm.onrender.com/api')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Monitoring & Logging

### Check Logs on Render
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Search for errors

### Enable Advanced Logging
```javascript
const morgan = require('morgan');
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
```

---

## Restart Service on Render

Sometimes a fresh restart helps:

1. Go to Render Dashboard
2. Select your service
3. Click "Connect" (upper right)
4. Click "Restart" or trigger a new deploy by pushing to GitHub

---

## Get Help

1. **Check Render Logs:** Most issues are visible here
2. **Verify Environment Variables:** Often the root cause
3. **Test Locally First:** Run `npm start` locally to verify
4. **Check MongoDB Connection:** Use MongoDB Atlas tools
5. **Review CORS Settings:** Must match your frontend URL

---

**Last Updated:** June 1, 2026
