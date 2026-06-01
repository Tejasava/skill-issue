require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { setIO } = require('./config/socket');
const errorHandler = require('./utils/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const friendRoutes = require('./routes/friendRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const communityRoutes = require('./routes/communityRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io attach
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:3000', process.env.CLIENT_URL || 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
setIO(io);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'http://localhost:5001', 'http://localhost:8080', 'https://*', 'blob:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'http://localhost:5001', 'http://localhost:8080', 'https://*'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: function (origin, callback) {
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      process.env.CLIENT_URL
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
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check routes
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      auth: '/api/auth',
      users: '/api/users',
      exchanges: '/api/exchanges',
      chat: '/api/chat',
      friends: '/api/friends',
      events: '/api/events',
      admin: '/api/admin',
      communities: '/api/communities',
      projects: '/api/projects'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use(errorHandler);

// Socket.io logic
io.on('connection', socket => {
  const { userId } = socket.handshake.query || {};
  if (userId) {
    socket.join(userId);
    console.log(`Socket connected: ${socket.id} joined room ${userId}`);
  }

  socket.on('sendMessage', async (payload) => {
    // payload: { conversationId, senderId, receiverId, content, messageType }
    try {
      const { saveMessage } = require('./controllers/chatController');
      const msg = await saveMessage(payload);
      if (msg && payload.receiverId) {
        io.to(payload.receiverId).emit('receiveMessage', msg);
      }
    } catch (err) {
      console.error('socket sendMessage error', err);
    }
  });

  socket.on('typing', ({ to }) => {
    if (to) io.to(to).emit('userTyping', { from: socket.handshake.query.userId });
  });

  socket.on('stopTyping', ({ to }) => {
    if (to) io.to(to).emit('userStopTyping', { from: socket.handshake.query.userId });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});
