# API Documentation - Skill Issue Backend

**Base URL:** `https://skill-issue-ihmm.onrender.com/api` (Production)  
**Base URL:** `http://localhost:5000/api` (Local Development)

## Health Check Endpoints

### GET /
Health check for the entire backend server.

**Response:**
```json
{
  "status": "success",
  "message": "Backend is running",
  "timestamp": "2026-06-01T10:00:00.000Z",
  "environment": "production"
}
```

**Status Code:** 200

---

### GET /api
API health check and available endpoints list.

**Response:**
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

**Status Code:** 200

---

## Authentication Endpoints (`/api/auth`)

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": { "id": "...", "username": "john_doe", "email": "john@example.com" },
  "token": "jwt_token_here"
}
```

**Status Code:** 201

---

### POST /api/auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": { "id": "...", "username": "john_doe", "email": "john@example.com" },
  "token": "jwt_token_here"
}
```

**Status Code:** 200

---

### POST /api/auth/admin/login
Admin login endpoint.

**Request Body:**
```json
{
  "adminId": "admin_username",
  "password": "admin_password"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Admin login successful",
  "token": "jwt_token_here"
}
```

**Status Code:** 200

---

### GET /api/auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "user": { "id": "...", "username": "john_doe", "email": "john@example.com" }
}
```

**Status Code:** 200

---

## User Endpoints (`/api/users`)

### GET /api/users
Get all users.

**Response (Success):**
```json
{
  "status": "success",
  "users": [
    { "id": "...", "username": "john_doe", "email": "john@example.com" },
    { "id": "...", "username": "jane_doe", "email": "jane@example.com" }
  ]
}
```

**Status Code:** 200

---

### GET /api/users/:id
Get user by ID.

**Response (Success):**
```json
{
  "status": "success",
  "user": { "id": "...", "username": "john_doe", "email": "john@example.com" }
}
```

**Status Code:** 200

---

### PUT /api/users/profile
Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data (if uploading avatar)
```

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "I love coding",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": { "id": "...", "username": "new_username" }
}
```

**Status Code:** 200

---

### POST /api/users/upload-work
Upload work portfolio (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
image: <file>
title: "Project Title"
description: "Project description"
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Work uploaded successfully",
  "work": { "id": "...", "title": "Project Title" }
}
```

**Status Code:** 201

---

### DELETE /api/users/work/:workId
Delete work portfolio item (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Work deleted successfully"
}
```

**Status Code:** 200

---

## Skill Exchange Endpoints (`/api/exchanges`)

### GET /api/exchanges
Get all skill exchanges.

**Response (Success):**
```json
{
  "status": "success",
  "exchanges": [
    { "id": "...", "offeringSkill": "JavaScript", "seekingSkill": "Python" }
  ]
}
```

**Status Code:** 200

---

### POST /api/exchanges
Create a new skill exchange (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "offeringSkill": "JavaScript",
  "seekingSkill": "Python",
  "description": "Looking to learn Python basics"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Exchange created successfully",
  "exchange": { "id": "...", "offeringSkill": "JavaScript" }
}
```

**Status Code:** 201

---

## Chat Endpoints (`/api/chat`)

### GET /api/chat/conversations
Get all conversations for current user (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "conversations": [
    { "id": "...", "participants": ["user1", "user2"], "lastMessage": "..." }
  ]
}
```

**Status Code:** 200

---

### POST /api/chat/messages
Send a message (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "conversationId": "conv_id",
  "receiverId": "receiver_id",
  "content": "Hello! How are you?"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": { "id": "...", "content": "Hello! How are you?" }
}
```

**Status Code:** 201

---

### GET /api/chat/messages/:conversationId
Get messages from a specific conversation (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "messages": [
    { "id": "...", "content": "Hello!", "senderId": "..." }
  ]
}
```

**Status Code:** 200

---

## Friend Endpoints (`/api/friends`)

### GET /api/friends
Get current user's friends (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "friends": [
    { "id": "...", "username": "friend1" }
  ]
}
```

**Status Code:** 200

---

### POST /api/friends/request
Send a friend request (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "recipientId": "user_id"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Friend request sent successfully"
}
```

**Status Code:** 201

---

## Event Endpoints (`/api/events`)

### GET /api/events
Get all events.

**Response (Success):**
```json
{
  "status": "success",
  "events": [
    { "id": "...", "title": "JavaScript Workshop", "date": "2026-06-15" }
  ]
}
```

**Status Code:** 200

---

### POST /api/events
Create a new event (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "JavaScript Workshop",
  "description": "Learn advanced JavaScript",
  "date": "2026-06-15",
  "location": "Online"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Event created successfully",
  "event": { "id": "...", "title": "JavaScript Workshop" }
}
```

**Status Code:** 201

---

## Community Endpoints (`/api/communities`)

### GET /api/communities
Get all communities.

**Response (Success):**
```json
{
  "status": "success",
  "communities": [
    { "id": "...", "name": "Web Developers", "members": 150 }
  ]
}
```

**Status Code:** 200

---

### POST /api/communities
Create a new community (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Web Developers",
  "description": "Community for web developers"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Community created successfully",
  "community": { "id": "...", "name": "Web Developers" }
}
```

**Status Code:** 201

---

## Project Endpoints (`/api/projects`)

### GET /api/projects
Get all projects.

**Response (Success):**
```json
{
  "status": "success",
  "projects": [
    { "id": "...", "title": "Skill Issue", "status": "active" }
  ]
}
```

**Status Code:** 200

---

### POST /api/projects
Create a new project (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Skill Issue",
  "description": "Peer coding platform",
  "technologies": ["Node.js", "React", "MongoDB"]
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Project created successfully",
  "project": { "id": "...", "title": "Skill Issue" }
}
```

**Status Code:** 201

---

## Admin Endpoints (`/api/admin`)

### GET /api/admin/users
Get all users (requires admin authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "status": "success",
  "users": [
    { "id": "...", "username": "john_doe", "email": "john@example.com" }
  ]
}
```

**Status Code:** 200

---

## WebSocket Events (Real-time Chat via Socket.IO)

### Connection
```javascript
const socket = io('https://skill-issue-ihmm.onrender.com', {
  query: { userId: 'your_user_id' }
});
```

### Send Message
```javascript
socket.emit('sendMessage', {
  conversationId: 'conv_id',
  senderId: 'your_id',
  receiverId: 'recipient_id',
  content: 'Hello!',
  messageType: 'text'
});
```

### Receive Message
```javascript
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});
```

### Typing Indicators
```javascript
socket.emit('typing', { to: 'recipient_id' });
socket.emit('stopTyping', { to: 'recipient_id' });
```

---

## Error Handling

All endpoints follow a consistent error response format:

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2026-06-01T10:00:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Environment Variables Required

```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl https://skill-issue-ihmm.onrender.com/

# API status
curl https://skill-issue-ihmm.onrender.com/api

# Register user
curl -X POST https://skill-issue-ihmm.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123"}'
```

### Using Postman

1. Import the base URL: `https://skill-issue-ihmm.onrender.com`
2. Create requests for each endpoint
3. Add `Authorization: Bearer <token>` header for authenticated routes
4. Send requests and check responses

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:*` (Development)
- `http://127.0.0.1:*` (Development)
- `http://10.*.*.*:*` (Internal)
- Your `CLIENT_URL` environment variable (Production)

**Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS  
**Allowed Headers:** Content-Type, Authorization

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:
- **Window:** 15 minutes
- **Max Requests:** 100 per window

---

## Support

For API issues or questions, please check:
1. Your environment variables are set correctly
2. MongoDB connection is active
3. JWT token is valid and not expired
4. CORS is configured for your frontend domain
5. Check server logs on Render dashboard

---

**Last Updated:** June 1, 2026
