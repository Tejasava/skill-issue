# Deployment Checklist

## Before Deployment

### Environment Setup
- [ ] Verify all environment variables are set in `.env.example`
- [ ] Ensure MongoDB Atlas cluster is created (or local MongoDB is running)
- [ ] Create Cloudinary account and get API credentials
- [ ] Create GitHub OAuth app (if needed)
- [ ] Set up email service (if needed)

### Code Review
- [ ] Test backend API locally with `npm run dev` in backend directory
- [ ] Test frontend locally with `npm run dev` in frontend directory
- [ ] Run frontend tests: `npm test`
- [ ] Check for console errors and warnings
- [ ] Verify Socket.IO connection works
- [ ] Test file uploads
- [ ] Test authentication flow

### Backend Deployment (Render.com)

1. **Create New Web Service**
   - [ ] Connect GitHub repository
   - [ ] Select `skill-issue` repository
   - [ ] Choose branch: `main`

2. **Configure Service**
   - [ ] Name: `skill-issue-backend`
   - [ ] Root directory: `.` (root of repo)
   - [ ] Environment: `Node`
   - [ ] Build command: `cd backend && npm install`
   - [ ] Start command: `cd backend && npm start`

3. **Environment Variables**
   - [ ] `NODE_ENV`: `production`
   - [ ] `PORT`: `3000`
   - [ ] `MONGO_URI`: MongoDB connection string
   - [ ] `JWT_SECRET`: Strong random secret (min 32 chars)
   - [ ] `CLOUDINARY_CLOUD_NAME`: Your cloud name
   - [ ] `CLOUDINARY_API_KEY`: Your API key
   - [ ] `CLOUDINARY_API_SECRET`: Your API secret
   - [ ] `CLIENT_URL`: https://your-frontend.vercel.app
   - [ ] `ADMIN_ID`: Your admin username
   - [ ] `ADMIN_PASSWORD`: Your admin password

4. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait for build to complete (5-10 minutes)
   - [ ] Note the service URL

### Frontend Deployment (Vercel)

1. **Import Project**
   - [ ] Go to vercel.com
   - [ ] Click "New Project"
   - [ ] Select GitHub account
   - [ ] Choose `skill-issue` repository

2. **Configure Project**
   - [ ] Root directory: `.` (or select from options)
   - [ ] Framework preset: `Vite`
   - [ ] Build command: `cd frontend && npm install && npm run build`
   - [ ] Output directory: `frontend/dist`
   - [ ] Install command: `npm install`

3. **Environment Variables**
   - [ ] `VITE_API_URL`: https://your-backend.onrender.com (Render backend URL)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for build to complete (2-5 minutes)
   - [ ] Visit deployed URL

### Post-Deployment Testing

- [ ] Access frontend URL in browser
- [ ] Test user signup
- [ ] Test user login
- [ ] Test real-time chat (WebSocket)
- [ ] Test file uploads
- [ ] Test skill exchange creation
- [ ] Test event creation
- [ ] Test community posts
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Verify API calls reach backend
- [ ] Test Socket.IO connection

### Monitoring Setup

- [ ] Enable error tracking on Render (Sentry, etc.)
- [ ] Set up monitoring on Vercel
- [ ] Create error alert notifications
- [ ] Check logs regularly

### DNS & Domain Setup (Optional)

- [ ] Purchase domain (if needed)
- [ ] Configure domain on Vercel
- [ ] Configure domain on Render (if applicable)
- [ ] Set up SSL certificate (auto on Vercel)
- [ ] Test HTTPS connection

### Security Hardening

- [ ] Verify CORS is configured correctly
- [ ] Test rate limiting
- [ ] Verify JWT tokens expire
- [ ] Check password hashing
- [ ] Enable HTTPS everywhere
- [ ] Review security headers
- [ ] Check API authentication requirements

### Performance Optimization

- [ ] Check frontend build size
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Check API response times
- [ ] Monitor backend resource usage
- [ ] Check database indexing

## Troubleshooting

### Frontend Issues
- Clear Vercel cache and redeploy
- Check environment variables are set
- Verify API URL is correct
- Check browser console for errors

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set
- Test MongoDB connection
- Check Cloudinary credentials
- Verify CORS settings

### WebSocket Issues
- Ensure WebSocket is enabled on Render
- Check Socket.IO CORS configuration
- Verify CLIENT_URL matches frontend domain
- Test connection in browser DevTools

## Additional Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Render Deployment Guide](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Cloudinary API Reference](https://cloudinary.com/documentation)

## Support Contacts

- GitHub Issues: https://github.com/Tejasava/skill-issue/issues
- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/support
- MongoDB Support: https://www.mongodb.com/support
