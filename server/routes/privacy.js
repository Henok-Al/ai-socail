const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /privacy - Get current privacy settings
router.get('/privacy', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId).select('privacySettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Privacy settings fetched successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Fetch privacy settings error:', error);
    res.status(500).json({ message: 'Server error during privacy settings fetch' });
  }
});

// PUT /privacy - Update privacy settings
router.put('/privacy', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileVisibility, postVisibility, contactPermission } = req.body;
    
    // Prepare update object
    const updates = {};
    if (profileVisibility !== undefined) updates['privacySettings.profileVisibility'] = profileVisibility;
    if (postVisibility !== undefined) updates['privacySettings.postVisibility'] = postVisibility;
    if (contactPermission !== undefined) updates['privacySettings.contactPermission'] = contactPermission;
    
    // Update user privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('privacySettings');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Privacy settings updated successfully',
      privacySettings: updatedUser.privacySettings
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Server error during privacy settings update' });
  }
});

module.exports = router;