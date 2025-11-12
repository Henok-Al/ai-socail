// Mock moderation service - in a real application, this would integrate with an AI moderation API

// Function to check if content is appropriate
const moderateContent = async (content) => {
  // In a real application, this would call an AI moderation API
  // For now, we'll use a simple keyword-based approach for demonstration
  
  // List of inappropriate keywords (simplified for demonstration)
  const inappropriateKeywords = [
    'violence', 'hate', 'spam', 'inappropriate'
  ];
  
  // Convert content to lowercase for comparison
  const lowerContent = content.toLowerCase();
  
  // Check if any inappropriate keywords are present
  const hasInappropriateContent = inappropriateKeywords.some(keyword => 
    lowerContent.includes(keyword)
  );
  
  if (hasInappropriateContent) {
    return {
      approved: false,
      reason: 'Content contains inappropriate keywords'
    };
  }
  
  return {
    approved: true,
    reason: null
  };
};

// Function to moderate a post
const moderatePost = async (post) => {
  try {
    // Moderate the post content
    const moderationResult = await moderateContent(post.content);
    
    // Update post moderation status
    post.moderationStatus = moderationResult.approved ? 'approved' : 'rejected';
    post.moderationReason = moderationResult.reason;
    
    // If rejected, unpublish the post
    if (!moderationResult.approved) {
      post.isPublished = false;
    }
    
    // Save the post
    await post.save();
    
    return {
      approved: moderationResult.approved,
      reason: moderationResult.reason
    };
  } catch (error) {
    console.error('Error moderating post:', error);
    throw error;
  }
};

module.exports = { moderatePost };