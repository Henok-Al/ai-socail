const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { extractHashtags } = require('../utils/hashtagExtractor');
const { moderatePost } = require('../services/moderationService');
const { extractUrls, getLinkPreview } = require('../utils/linkPreview');

const router = express.Router();

// POST /posts - Create a new post with media upload (protected route)
router.post('/posts', auth, upload.single('media'), async (req, res) => {
  try {
    const { content, scheduledAt, location } = req.body;
    
    // Extract hashtags from content
    const hashtags = extractHashtags(content);
    
    // Extract URLs from content
    const urls = extractUrls(content);
    
    // Get link preview for the first URL if available
    let linkPreview = null;
    if (urls.length > 0) {
      linkPreview = await getLinkPreview(urls[0]);
    }
    
    // Determine if this is a scheduled post
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const isPublished = !isScheduled;
    
    // Create new post
    const post = new Post({
      author: req.user.id,
      content,
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : '',
      hashtags,
      scheduledAt: isScheduled ? new Date(scheduledAt) : undefined,
      isPublished,
      location: location ? {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
        name: location.name || ''
      } : undefined,
      linkPreview
    });
    
    // Moderate the post
    const moderationResult = await moderatePost(post);
    
    const savedPost = await post.save();
    
    // Populate the author field
    await savedPost.populate('author', 'username email');
    
    res.status(201).json({
      message: isScheduled ? 'Post scheduled successfully' : 
             moderationResult.approved ? 'Post created successfully' : 'Post created but requires moderation',
      post: savedPost,
      moderation: moderationResult
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Server error during post creation' });
  }
});

// POST /posts/poll - Create a new poll post
router.post('/posts/poll', auth, async (req, res) => {
  try {
    const { content, poll, scheduledAt, location } = req.body;
    
    // Validate poll data
    if (!poll || !poll.question || !poll.options || !Array.isArray(poll.options) || poll.options.length < 2) {
      return res.status(400).json({ message: 'Poll must have a question and at least 2 options' });
    }
    
    // Validate poll options
    const validOptions = poll.options.filter(option => option && option.text && option.text.trim().length > 0);
    if (validOptions.length < 2) {
      return res.status(400).json({ message: 'Poll must have at least 2 valid options' });
    }
    
    // Format poll options
    const formattedOptions = validOptions.map(option => ({
      text: option.text.trim(),
      votes: []
    }));
    
    // Extract URLs from content
    const urls = extractUrls(content || '');
    
    // Get link preview for the first URL if available
    let linkPreview = null;
    if (urls.length > 0) {
      linkPreview = await getLinkPreview(urls[0]);
    }
    
    // Determine if this is a scheduled post
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const isPublished = !isScheduled;
    
    // Create new poll post
    const post = new Post({
      author: req.user.id,
      content: content || '',
      poll: {
        question: poll.question.trim(),
        options: formattedOptions,
        expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : undefined
      },
      scheduledAt: isScheduled ? new Date(scheduledAt) : undefined,
      isPublished,
      location: location ? {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
        name: location.name || ''
      } : undefined,
      linkPreview
    });
    
    // Moderate the post
    const moderationResult = await moderatePost(post);
    
    const savedPost = await post.save();
    
    // Populate the author field
    await savedPost.populate('author', 'username email');
    
    res.status(201).json({
      message: isScheduled ? 'Poll scheduled successfully' : 
             moderationResult.approved ? 'Poll created successfully' : 'Poll created but requires moderation',
      post: savedPost,
      moderation: moderationResult
    });
  } catch (error) {
    console.error('Poll creation error:', error);
    res.status(500).json({ message: 'Server error during poll creation' });
  }
});

// POST /posts/:id/poll/vote - Vote on a poll
router.post('/posts/:id/poll/vote', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { optionIndex } = req.body;
    const userId = req.user.id;
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has a poll
    if (!post.poll) {
      return res.status(400).json({ message: 'Post does not have a poll' });
    }
    
    // Check if poll has expired
    if (post.poll.expiresAt && new Date(post.poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Poll has expired' });
    }
    
    // Validate option index
    if (optionIndex === undefined || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }
    
    // Check if user has already voted
    const hasVoted = post.poll.options.some(option => 
      option.votes.some(voteId => voteId.toString() === userId)
    );
    
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }
    
    // Add vote to the selected option
    post.poll.options[optionIndex].votes.push(userId);
    
    // Save the post
    const updatedPost = await post.save();
    
    // Populate the author field
    await updatedPost.populate('author', 'username email');
    
    res.json({
      message: 'Vote recorded successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Poll vote error:', error);
    res.status(500).json({ message: 'Server error during poll vote' });
  }
});

module.exports = router;