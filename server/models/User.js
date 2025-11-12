const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    postVisibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    contactPermission: {
      type: String,
      enum: ['everyone', 'followers', 'none'],
      default: 'everyone'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);