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
    title: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    placement: {
      type: Number,
      min: 1,
      default: null,
      index: true,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

submissionSchema.index({ contestId: 1, authorId: 1 }, { unique: true })

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission