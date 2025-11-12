const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /safety/block/:id - Block a user
router.post('/safety/block/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    // Prevent users from blocking themselves
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
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
    
    // Check if already blocked
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);
    
    if (isBlocked) {
      return res.status(400).json({ message: 'User is already blocked' });
    }
    
    // Add target user to blocked users
    currentUser.blockedUsers.push(targetUserId);
    
    // Save the current user
    await currentUser.save();
    
    res.json({
      message: 'User blocked successfully',
      blocked: true
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error during block operation' });
  }
});

// DELETE /safety/block/:id - Unblock a user
router.delete('/safety/block/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    
    // Find current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    
    // Check if user is blocked
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);
    
    if (!isBlocked) {
      return res.status(400).json({ message: 'User is not blocked' });
    }
    
    // Remove target user from blocked users
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== targetUserId.toString()
    );
    
    // Save the current user
    await currentUser.save();
    
    res.json({
      message: 'User unblocked successfully',
      blocked: false
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error during unblock operation' });
  }
});

// POST /safety/report/:id - Report a user
router.post('/safety/report/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { reason, description } = req.body;
    const currentUserId = req.user.id;
    
    // Prevent users from reporting themselves
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }
    
    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real application, you would save the report to a database
    // For now, we'll just log it and return a success message
    console.log(`User ${currentUserId} reported user ${targetUserId} for reason: ${reason}, description: ${description}`);
    
    // Here you would typically:
    // 1. Save the report to a reports collection
    // 2. Notify administrators
    // 3. Take appropriate action based on your platform's policies
    
    res.json({
      message: 'User reported successfully. Our team will review the report.',
      reported: true
    });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ message: 'Server error during report operation' });
  }
});

module.exports = router;