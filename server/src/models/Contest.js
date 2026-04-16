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
    wordLimit :{
      type: Number,
      enum: [500, 1000, 5000, 10000],
      required: true
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
    votingMode: {
      type: String,
      enum: ['PUBLIC', 'PARTICIPANTS_ONLY', 'JUDGES_ONLY'],
      default: 'PUBLIC',
      required: true,
    },
    judges: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Contest = mongoose.model('Contest', contestSchema)

export default Contest