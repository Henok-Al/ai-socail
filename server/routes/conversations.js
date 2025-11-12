const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /conversations - Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate([
      { path: 'participants', select: 'username email' },
      { path: 'lastMessage' }
    ])
    .sort({ updatedAt: -1 });
    
    res.json({
      message: 'Conversations fetched successfully',
      conversations
    });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ message: 'Server error during conversations fetch' });
  }
});

// POST /conversations - Create a new conversation (private chat or group chat)
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participants, groupName, isGroup } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (isGroup) {
      if (!groupName || groupName.trim().length === 0) {
        return res.status(400).json({ message: 'Group name is required for group conversations' });
      }
      
      if (!participants || !Array.isArray(participants) || participants.length < 2) {
        return res.status(400).json({ message: 'Group conversations require at least 2 participants' });
      }
      
      // Ensure creator is in participants
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      
      // Create group
      const group = new Group({
        name: groupName.trim(),
        members: participants,
        creator: userId
      });
      
      const savedGroup = await group.save();
      
      // Create conversation
      const conversation = new Conversation({
        participants,
        isGroup: true,
        group: savedGroup._id
      });
      
      const savedConversation = await conversation.save();
      
      // Populate the conversation
      await savedConversation.populate([
        { path: 'participants', select: 'username email' },
        { path: 'group' }
      ]);
      
      res.status(201).json({
        message: 'Group conversation created successfully',
        conversation: savedConversation
      });
    } else {
      // Private chat
      if (!participants || !Array.isArray(participants) || participants.length !== 1) {
        return res.status(400).json({ message: 'Private conversations require exactly 1 participant' });
      }
      
      const otherUserId = participants[0];
      
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [userId, otherUserId], $size: 2 }
      });
      
      if (existingConversation) {
        await existingConversation.populate([
          { path: 'participants', select: 'username email' }
        ]);
        
        return res.json({
          message: 'Conversation already exists',
          conversation: existingConversation
        });
      }
      
      // Create new private conversation
      const conversation = new Conversation({
        participants: [userId, otherUserId],
        isGroup: false
      });
      
      const savedConversation = await conversation.save();
      
      // Populate the conversation
      await savedConversation.populate([
        { path: 'participants', select: 'username email' }
      ]);
      
      res.status(201).json({
        message: 'Private conversation created successfully',
        conversation: savedConversation
      });
    }
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error during conversation creation' });
  }
});

// GET /conversations/:id/messages - Get messages for a specific conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    
    // Find the conversation and check if user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const isParticipant = conversation.participants.some(
      participant => participant.toString() === userId
    );
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }
    
    // Find messages for this conversation
    const messages = await Message.find({
      $or: [
        { recipient: conversationId },
        { group: conversation.group }
      ]
    })
    .populate('sender', 'username email')
    .sort({ createdAt: 1 });
    
    res.json({
      message: 'Messages fetched successfully',
      messages
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Server error during messages fetch' });
  }
});

// POST /conversations/:id/messages - Send a new message in a conversation
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { content, messageType } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Find the conversation and check if user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const isParticipant = conversation.participants.some(
      participant => participant.toString() === userId
    );
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' });
    }
    
    // Create new message
    const message = new Message({
      sender: userId,
      content: content.trim(),
      messageType: messageType || 'text',
      recipient: conversation.isGroup ? null : conversationId,
      group: conversation.isGroup ? conversation.group : null
    });
    
    const savedMessage = await message.save();
    
    // Update conversation's last message
    conversation.lastMessage = savedMessage._id;
    await conversation.save();
    
    // Populate the message
    await savedMessage.populate('sender', 'username email');
    
    // Emit socket event for real-time messaging
    // This would be implemented in a real application with Socket.IO
    
    res.status(201).json({
      message: 'Message sent successfully',
      message: savedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error during message sending' });
  }
});

module.exports = router;