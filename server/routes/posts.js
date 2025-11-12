const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /posts - Create a new post (protected route)
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;
    
    // Create new post
    const post = new Post({
      author: req.user.id,
      content,
      mediaUrl: mediaUrl || ''
    });
    
    const savedPost = await post.save();
    
    // Populate the author field
    await savedPost.populate('author', 'username email');
    
    res.status(201).json({
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Server error during post creation' });
  }
});

// GET /posts/feed - Fetch all posts with populated author field, sorted by creation date
router.get('/posts/feed', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      message: 'Posts fetched successfully',
      posts
    });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: 'Server error during posts fetching' });
  }
});

// POST /posts/:id/like - Toggle like on a post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user has already liked the post
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // User has already liked the post, so remove the like (unlike)
      post.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked the post, so add the like
      post.likes.push(userId);
    }
    
    // Save the updated post
    const updatedPost = await post.save();
    
    // Populate the author field
    await updatedPost.populate('author', 'username email');
    
    res.json({
      message: likeIndex > -1 ? 'Post unliked successfully' : 'Post liked successfully',
      post: updatedPost,
      likesCount: updatedPost.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error during like operation' });
  }
});

// POST /posts/:id/comment - Add a new comment to a post
router.post('/posts/:id/comment', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Validate comment content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create new comment object
    const newComment = {
      userId,
      content: content.trim(),
      timestamp: new Date()
    };
    
    // Add comment to post
    post.comments.push(newComment);
    
    // Save the updated post
    const updatedPost = await post.save();
    
    // Populate the author field and comments' userId fields
    await updatedPost.populate([
      { path: 'author', select: 'username email' },
      { path: 'comments.userId', select: 'username email' }
    ]);
    
    res.status(201).json({
      message: 'Comment added successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment addition' });
  }
});

module.exports = router;