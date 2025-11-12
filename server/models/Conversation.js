const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// For group conversations, ensure group field is required
conversationSchema.pre('validate', function(next) {
  if (this.isGroup && !this.group) {
    next(new Error('Group field is required for group conversations'));
  } else if (!this.isGroup && this.group) {
    next(new Error('Group field should not be set for private conversations'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);