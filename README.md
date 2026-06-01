# Skill Issue

**Peer Coding & Skill Exchange Platform**

A comprehensive full-stack application that connects developers and tech enthusiasts to exchange skills, collaborate on projects, and build a supportive community.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication
- **Skill Exchange**: List and exchange programming skills with other developers
- **Real-time Chat**: Socket.IO powered instant messaging
- **Project Collaboration**: Create and manage collaborative projects
- **Community Forums**: Join and participate in community discussions
- **Events Management**: Create, discover, and attend tech events
- **Friend System**: Connect with other developers
- **User Profiles**: Showcase skills, projects, and experience

### Admin Features
- User management
- Community moderation
- Event oversight
- Report handling
- Exchange monitoring
- Project validation

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

## 🛠️ Tech Stack

### Backend
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for image storage

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- Zustand for state management

## 📦 Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment

This project is configured for easy deployment on:
- **Frontend**: Vercel
- **Backend**: Render

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Project Structure

```
skill-issue/
├── backend/
│   ├── config/          # Database, Socket.IO, Cloudinary config
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities
│   │   ├── stores/      # State management
│   │   └── App.tsx      # Main App component
│   ├── vite.config.ts
│   └── package.json
├── vercel.json          # Vercel configuration
├── render.yaml          # Render configuration
└── DEPLOYMENT.md        # Deployment guide
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user profile |
| GET | `/api/chat/conversations` | Get conversations |
| POST | `/api/chat/messages` | Send message |
| GET | `/api/exchanges` | Get skill exchanges |
| POST | `/api/exchanges` | Create exchange |
| GET | `/api/events` | Get events |
| POST | `/api/events` | Create event |
| GET | `/api/projects` | Get projects |
| POST | `/api/projects` | Create project |
| GET | `/api/community` | Get community posts |
| POST | `/api/community` | Create post |

See backend README for complete API documentation.

## 🔐 Environment Variables

### Backend
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Frontend lint
npm run lint
```

## 📱 Features in Detail

### Real-time Chat
- One-on-one messaging
- Real-time notifications
- Message history
- Online status

### Skill Exchange
- List your skills
- Request skill exchanges
- Review and ratings system
- Exchange history

### Projects
- Create collaborative projects
- Add team members
- Track progress
- Share project details

### Community
- Create discussion posts
- Comment and engage
- Search and filter posts
- Community moderation

### Events
- Event creation and management
- Event discovery
- Participant management
- Event details and agenda

## 🐛 Bug Reports

Found a bug? Please create an issue on GitHub with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 💡 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 📞 Support

For support, email or create an issue in the GitHub repository.

---

**Happy Coding! 🎉**
