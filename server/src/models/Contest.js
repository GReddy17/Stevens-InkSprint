import mongoose from 'mongoose'

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
      enum: ['UPCOMING', 'ACTIVE', 'CLOSED', 'VOTING', 'JUDGING', 'COMPLETED'],
      default: 'UPCOMING',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    votingType: {
      type: String,
      enum: ['EVERYONE', 'JUDGES', 'CREATOR', 'GROUP'],
      default: 'EVERYONE',
    },
    votingDurationHours: {
      type: Number,
      default: 48,
    },
    votingGroupMemberIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);


const Contest = mongoose.model('Contest', contestSchema);

export default Contest