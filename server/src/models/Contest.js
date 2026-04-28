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
      enum: ['EVERYONE', 'JUDGES', 'CREATOR'],
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
    /*Option: Contest Creator can set a wordMin & Max for all submissions
     We'll need to add validators to this.
     wordMin CAN be null, but if its a number, then it cannot be less than 0 (0 = null)
     wordMax CAN be null. But wordMax > wordMin if it exists (again, null = 0 in wordMin's case)
     Also we should probably include a limit to how big wordMax can be, possibly like 500,000 or 1,000,000
    */
    wordMin: {
      type: Number,
      default: null
    },
    wordMax: {
      type: Number,
      default: null
    },
  },
  {
    timestamps: true,
  }
);


const Contest = mongoose.model('Contest', contestSchema);

export default Contest