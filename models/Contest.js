const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'CLOSED', 'JUDGING', 'COMPLETED'],
      default: 'UPCOMING',
      index: true, 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, 
    },
  },
  {
    timestamps: true,
  }
);


const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;