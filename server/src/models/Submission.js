import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentUrl: {
      type: String,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    placement: {
      type: Number,
      min: 1,
      default: null,
      index: true,
    },
    certificateUrl: {
      type: String,
    },
    certificateGeneratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

submissionSchema.index({ contestId: 1, authorId: 1 }, { unique: true })

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission
