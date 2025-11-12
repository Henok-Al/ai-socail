const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /search?q= - Search for users and posts
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    
    // Validate search query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Search query is required', 
        results: { users: [], posts: [] } 
      });
    }
    
    const searchTerm = query.trim();
    
    // Search for users by username (case insensitive)
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' }
    }).select('username email bio');
    
    // Search for posts by content (case insensitive)
    const posts = await Post.find({
      content: { $regex: searchTerm, $options: 'i' }
    })
    .populate('author', 'username email')
    .sort({ createdAt: -1 });
    
    res.json({
      message: 'Search completed successfully',
      results: {
        users,
        posts
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Server error during search', 
      results: { users: [], posts: [] } 
    });
  }
});

module.exports = router;