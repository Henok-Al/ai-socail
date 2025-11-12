const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /notifications - Get all notifications for the authenticated user
router.get('/notifications', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all notifications for the user
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username email')
      .populate('post')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent notifications
    
    res.json({
      message: 'Notifications fetched successfully',
      notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error during notifications fetch' });
  }
});

// PUT /notifications/:id/read - Mark a notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Find the notification and check if it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Mark as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error during marking notification as read' });
  }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mark all unread notifications as read
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error during marking all notifications as read' });
  }
});

// DELETE /notifications/:id - Delete a notification
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Find the notification and check if it belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Delete the notification
    await Notification.deleteOne({ _id: notificationId });
    
    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error during notification deletion' });
  }
});

module.exports = router;