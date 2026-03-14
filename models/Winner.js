Winner.js
const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true, 
    },
    placement: {
      type: Number,
      required: true,
      min: 1,
    },
    certificateUrl: {
      type: String, 
    },
    generatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

winnerSchema.index({ contestId: 1, placement: 1 });

const Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;