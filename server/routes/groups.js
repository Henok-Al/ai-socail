const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /groups - Create a new group
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, members } = req.body;
    const creatorId = req.user.id;
    
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    
    // Ensure creator is in members list
    const memberIds = members && Array.isArray(members) ? [...members] : [];
    if (!memberIds.includes(creatorId)) {
      memberIds.push(creatorId);
    }
    
    // Create new group
    const group = new Group({
      name: name.trim(),
      members: memberIds,
      creator: creatorId,
      messages: []
    });
    
    const savedGroup = await group.save();
    
    // Populate the group with member details
    await savedGroup.populate([
      { path: 'members', select: 'username email' },
      { path: 'creator', select: 'username email' }
    ]);
    
    // Update all members to include this group in their groups array
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { groups: savedGroup._id } }
    );
    
    res.status(201).json({
      message: 'Group created successfully',
      group: savedGroup
    });
  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ message: 'Server error during group creation' });
  }
});

// GET /groups/:id - Fetch a group and its message history
router.get('/groups/:id', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    // Find the group and check if user is a member
    const group = await Group.findById(groupId)
      .populate([
        { path: 'members', select: 'username email' },
        { path: 'creator', select: 'username email' },
        { path: 'messages.userId', select: 'username email' }
      ]);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }
    
    res.json({
      message: 'Group fetched successfully',
      group
    });
  } catch (error) {
    console.error('Fetch group error:', error);
    res.status(500).json({ message: 'Server error during group fetch' });
  }
});

module.exports = router;