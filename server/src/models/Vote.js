import mongoose from 'mongoose'

const voteSchema = new mongoose.Schema(
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
      index: true,
    },
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

voteSchema.index({ submissionId: 1, voterId: 1 }, { unique: true })
voteSchema.index({ contestId: 1, voterId: 1 })

const Vote = mongoose.model('Vote', voteSchema)

export default Vote
