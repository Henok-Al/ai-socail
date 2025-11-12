const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  repost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  repostComment: {
    type: String,
    trim: true
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  scheduledAt: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationReason: {
    type: String
  },
  poll: {
    question: {
      type: String,
      trim: true
    },
    options: [{
      text: {
        type: String,
        trim: true
      },
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    expiresAt: {
      type: Date
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    name: {
      type: String,
      trim: true
    }
  },
  linkPreview: {
    url: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    siteName: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);