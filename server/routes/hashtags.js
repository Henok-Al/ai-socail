const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /hashtags/trending - Get trending hashtags
router.get('/hashtags/trending', auth, async (req, res) => {
  try {
    // Aggregate to find the most used hashtags in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingHashtags = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, hashtags: { $exists: true, $ne: [] } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      message: 'Trending hashtags fetched successfully',
      hashtags: trendingHashtags.map(tag => ({
        hashtag: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    console.error('Fetch trending hashtags error:', error);
    res.status(500).json({ message: 'Server error during trending hashtags fetch' });
  }
});

// GET /hashtags/:hashtag - Get posts with a specific hashtag
router.get('/hashtags/:hashtag', auth, async (req, res) => {
  try {
    const { hashtag } = req.params;
    
    // Find posts with the specified hashtag
    const posts = await Post.find({ hashtags: hashtag })
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent posts
    
    res.json({
      message: `Posts with hashtag #${hashtag} fetched successfully`,
      posts,
      hashtag
    });
  } catch (error) {
    console.error('Fetch hashtag posts error:', error);
    res.status(500).json({ message: 'Server error during hashtag posts fetch' });
  }
});

module.exports = router;