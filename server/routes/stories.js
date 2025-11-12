const express = require('express');
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /stories - Create a new story
router.post('/stories', auth, upload.single('media'), async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id;
    
    // Validate media upload
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }
    
    // Determine media type
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create new story
    const story = new Story({
      author: userId,
      mediaUrl: `/uploads/${req.file.filename}`,
      mediaType,
      caption: caption || '',
      expiresAt
    });
    
    const savedStory = await story.save();
    
    // Populate the author field
    await savedStory.populate('author', 'username email');
    
    res.status(201).json({
      message: 'Story created successfully',
      story: savedStory
    });
  } catch (error) {
    console.error('Story creation error:', error);
    res.status(500).json({ message: 'Server error during story creation' });
  }
});

// GET /stories - Get all active stories from users that the current user follows
router.get('/stories', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the current user to get their following list
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get users that the current user follows
    const followingIds = user.following || [];
    
    // Include the current user in the list
    followingIds.push(userId);
    
    // Find active stories from followed users
    const stories = await Story.find({
      author: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    })
    .populate('author', 'username email')
    .sort({ createdAt: -1 });
    
    res.json({
      message: 'Stories fetched successfully',
      stories
    });
  } catch (error) {
    console.error('Fetch stories error:', error);
    res.status(500).json({ message: 'Server error during stories fetch' });
  }
});

// GET /stories/:id/view - View a story
router.get('/stories/:id/view', auth, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;
    
    // Find the story
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if story has expired
    if (story.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Story has expired' });
    }
    
    // Check if user has already viewed the story
    const hasViewed = story.views.some(view => view.userId.toString() === userId);
    
    if (!hasViewed) {
      // Add view to the story
      story.views.push({ userId });
      await story.save();
    }
    
    // Populate the author field
    await story.populate('author', 'username email');
    
    res.json({
      message: 'Story viewed successfully',
      story
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error during story view' });
  }
});

// DELETE /stories/:id - Delete a story (only by the author)
router.delete('/stories/:id', auth, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;
    
    // Find the story
    const story = await Story.findOne({ _id: storyId, author: userId });
    if (!story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }
    
    // Delete the story
    await Story.deleteOne({ _id: storyId });
    
    res.json({
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error during story deletion' });
  }
});

module.exports = router;