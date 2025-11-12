const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure either recipient or group is provided, but not both
messageSchema.pre('validate', function(next) {
  if (this.recipient && this.group) {
    next(new Error('Message cannot have both recipient and group'));
  } else if (!this.recipient && !this.group) {
    next(new Error('Message must have either recipient or group'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);