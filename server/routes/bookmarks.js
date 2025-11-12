const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /bookmarks/:id - Bookmark a post
router.post('/bookmarks/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already bookmarked
    const isBookmarked = user.bookmarks.includes(postId);
    
    if (isBookmarked) {
      return res.status(400).json({ message: 'Post is already bookmarked' });
    }
    
    // Add post to bookmarks
    user.bookmarks.push(postId);
    
    // Save the user
    await user.save();
    
    res.json({
      message: 'Post bookmarked successfully',
      bookmarked: true
    });
  } catch (error) {
    console.error('Bookmark post error:', error);
    res.status(500).json({ message: 'Server error during bookmark operation' });
  }
});

// DELETE /bookmarks/:id - Remove a bookmark
router.delete('/bookmarks/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if bookmarked
    const isBookmarked = user.bookmarks.includes(postId);
    
    if (!isBookmarked) {
      return res.status(400).json({ message: 'Post is not bookmarked' });
    }
    
    // Remove post from bookmarks
    user.bookmarks = user.bookmarks.filter(
      id => id.toString() !== postId.toString()
    );
    
    // Save the user
    await user.save();
    
    res.json({
      message: 'Bookmark removed successfully',
      bookmarked: false
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error during remove bookmark operation' });
  }
});

// GET /bookmarks - Get all bookmarked posts for the user
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user and populate bookmarks
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: {
        path: 'author',
        select: 'username email'
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Bookmarked posts fetched successfully',
      posts: user.bookmarks
    });
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    res.status(500).json({ message: 'Server error during bookmarks fetch' });
  }
});

module.exports = router;