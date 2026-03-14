const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true, 
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'JUDGE', 'PARTICIPANT'],
      default: 'PARTICIPANT',
      index: true, 
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = User;