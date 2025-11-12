const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /users/:username - Fetches a user's profile data, including their posts
router.get('/users/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch user's posts
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'User profile fetched successfully',
      user: {
        ...user.toObject(),
        posts
      }
    });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    res.status(500).json({ message: 'Server error during profile fetch' });
  }
});

// PUT /users/profile - Allows the authenticated user to update their bio and profilePicture fields
router.put('/users/profile', auth, async (req, res) => {
  try {
    const { bio, profilePicture } = req.body;
    const userId = req.user.id;
    
    // Prepare update object
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// POST /users/:id/follow - Allows a user to toggle following another user
router.post('/users/:id/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    // Prevent users from following themselves
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    
    // Check if already following
    const isFollowing = targetUser.followers.includes(currentUserId);
    
    if (isFollowing) {
      // Unfollow: Remove current user from target's followers and target from current user's following
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId.toString()
      );
      
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId.toString()
      );
    } else {
      // Follow: Add current user to target's followers and target to current user's following
      targetUser.followers.push(currentUserId);
      currentUser.following = currentUser.following || [];
      currentUser.following.push(targetUserId);
    }
    
    // Save both users
    await targetUser.save();
    await currentUser.save();
    
    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing, // Return the new state
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error during follow operation' });
  }
});

module.exports = router;