// models/User.js - MongoDB User schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email'
    ],
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'operator'],
    default: 'user'
  },
  organization: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    dashboardLayout: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create JWT token for authentication
UserSchema.methods.createJWT = function() {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    config.jwtSecret,
    { expiresIn: config.jwtLifetime }
  );
};

// Compare password with hashed password in database
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login time
UserSchema.methods.updateLoginTime = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Find users by role
UserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;