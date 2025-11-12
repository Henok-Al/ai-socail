const cron = require('node-cron');
const Post = require('../models/Post');

// Function to publish scheduled posts
const publishScheduledPosts = async () => {
  try {
    const now = new Date();
    
    // Find posts that are scheduled and due to be published
    const scheduledPosts = await Post.find({
      isPublished: false,
      scheduledAt: { $lte: now }
    });
    
    if (scheduledPosts.length > 0) {
      // Update all scheduled posts to published
      const postIds = scheduledPosts.map(post => post._id);
      
      await Post.updateMany(
        { _id: { $in: postIds } },
        { $set: { isPublished: true } }
      );
      
      console.log(`Published ${scheduledPosts.length} scheduled posts`);
    }
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
  }
};

// Schedule the task to run every minute
const startScheduledPostsPublisher = () => {
  // Run every minute
  cron.schedule('* * * * *', publishScheduledPosts);
  console.log('Scheduled posts publisher started');
};

module.exports = { startScheduledPostsPublisher };