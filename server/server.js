const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining
  socket.on('user-joined', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });
  
  // Handle post liked event
  socket.on('post-liked', (data) => {
    // Broadcast to all connected clients
    socket.broadcast.emit('post-liked-update', data);
  });
  
  // Handle new comment event
  socket.on('new-comment', (data) => {
    // Broadcast to all connected clients
    socket.broadcast.emit('new-comment-update', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('AI Social API is running...');
});

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Posts routes
const postRoutes = require('./routes/posts');
app.use('/api', postRoutes);

// AI routes
const aiRoutes = require('./routes/ai');
app.use('/api', aiRoutes);

// Search routes
const searchRoutes = require('./routes/search');
app.use('/api', searchRoutes);

// Users routes
const userRoutes = require('./routes/users');
app.use('/api', userRoutes);

// Groups routes
const groupRoutes = require('./routes/groups');
app.use('/api', groupRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});