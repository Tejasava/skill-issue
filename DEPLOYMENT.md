# Skill Issue - Peer Coding & Skill Exchange Platform

A full-stack web application built with Node.js/Express backend and React/TypeScript frontend.

## Project Structure

```
├── backend/          # Express.js API server
├── frontend/         # React + TypeScript + Vite
├── vercel.json       # Vercel deployment config
└── render.yaml       # Render deployment config
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **File Upload**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **API Client**: Fetch API

## Local Development

### Prerequisites
- Node.js 16+
- MongoDB running locally or Atlas connection
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:8080`

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Select the root directory
3. Build command: `cd frontend && npm install && npm run build`
4. Output directory: `frontend/dist`
5. Environment variables:
   - `VITE_API_URL`: Your backend API URL

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Set environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `CLIENT_URL`: Your Vercel frontend URL
   - `NODE_ENV`: `production`

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Frontend
Set in Vercel project settings:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## API Endpoints

Base URL: `/api`

### Auth Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Routes
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - Get all users

### Chat Routes
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/messages` - Send message
- `GET /api/chat/messages/:conversationId` - Get conversation messages

### Additional Routes
- Exchange endpoints
- Friend endpoints
- Event endpoints
- Community endpoints
- Project endpoints
- Admin endpoints

## Running Tests

```bash
# Frontend
cd frontend
npm run test

# Backend (if configured)
npm test
```

## Production Checklist

- [ ] Set all environment variables in production
- [ ] Configure CORS properly for production domains
- [ ] Enable SSL/HTTPS
- [ ] Set up MongoDB backups
- [ ] Configure rate limiting
- [ ] Test WebSocket connections
- [ ] Verify file upload functionality
- [ ] Set up error monitoring/logging
- [ ] Test API authentication
- [ ] Verify email notifications (if applicable)

## Troubleshooting

### CORS Issues
- Ensure `CLIENT_URL` in backend .env matches your frontend URL
- Check `origin` in Socket.IO configuration

### MongoDB Connection
- Verify MongoDB is running or connection string is correct
- Check network access in MongoDB Atlas

### File Upload Issues
- Verify Cloudinary credentials are correct
- Check file size limits

### Socket.IO Connection
- Ensure WebSocket is enabled on your hosting provider
- Check CORS settings for WebSocket

## License

ISC

## Support

For issues and questions, please create an issue in the GitHub repository.
