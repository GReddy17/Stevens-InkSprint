import mongoose from 'mongoose'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import Vote from '../models/Vote.js'
import { getRedis } from '../config/redisClient.js'
import {
  validateString,
  validateEmail,
  validateContestStatus,
  validateVotingType,
  validateDates,
  validatePoints,
  validateWordLimits,
} from '../utils/validation.js'

// Cache helpers
const cacheGet = async (key) => {
  try {
    const client = await getRedis()
    if (!client) return null
    const cached = await client.get(key)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const cacheSet = async (key, value, ttl = 300) => {
  try {
    const client = await getRedis()
    if (!client) return
    await client.set(key, JSON.stringify(value), { EX: ttl })
  } catch {}
}

const cacheFlush = async () => {
  try {
    const client = await getRedis()
    if (!client) return
    await client.flushAll()
  } catch {}
}

export const resolvers = {
  Query: {
    healthCheck: () => 'Ink Sprint GraphQL server is running',

    // Users
    users: async () => {
      const cached = await cacheGet('users')
      if (cached) return cached
      const data = await User.find({})
      await cacheSet('users', data)
      return data
    },

    user: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid user ID')
      const cached = await cacheGet(`user:${id}`)
      if (cached) return cached
      const user = await User.findById(id)
      if (!user) throw new Error('User not found')
      await cacheSet(`user:${id}`, user)
      return user
    },

    // Contests
    contests: async () => {
      const cached = await cacheGet('contests')
      if (cached) return cached
      const data = await Contest.find({}).sort({ createdAt: -1 })
      await cacheSet('contests', data)
      return data
    },

    contest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID')
      const cached = await cacheGet(`contest:${id}`)
      if (cached) return cached
      const contest = await Contest.findById(id)
      if (!contest) throw new Error('Contest not found')
      await cacheSet(`contest:${id}`, contest)
      return contest
    },

    contestsByStatus: async (_, { status }) => {
      const validStatus = validateContestStatus(status)
      const cached = await cacheGet(`contests:status:${validStatus}`)
      if (cached) return cached
      const data = await Contest.find({ status: validStatus }).sort({ createdAt: -1 })
      await cacheSet(`contests:status:${validStatus}`, data)
      return data
    },

    // Submissions
    submissions: async () => {
      const cached = await cacheGet('submissions')
      if (cached) return cached
      const data = await Submission.find({}).sort({ submittedAt: -1 })
      await cacheSet('submissions', data)
      return data
    },

    submission: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid submission ID')
      const cached = await cacheGet(`submission:${id}`)
      if (cached) return cached
      const submission = await Submission.findById(id)
      if (!submission) throw new Error('Submission not found')
      await cacheSet(`submission:${id}`, submission)
      return submission
    },

    submissionsByContest: async (_, { contestId }) => {
      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID')
      const cached = await cacheGet(`submissions:contest:${contestId}`)
      if (cached) return cached
      const data = await Submission.find({ contestId }).sort({ totalScore: -1 })
      await cacheSet(`submissions:contest:${contestId}`, data)
      return data
    },

    submissionsByUser: async (_, { authorId }) => {
      if (!mongoose.Types.ObjectId.isValid(authorId)) throw new Error('Invalid user ID')
      const cached = await cacheGet(`submissions:user:${authorId}`)
      if (cached) return cached
      const data = await Submission.find({ authorId }).sort({ submittedAt: -1 })
      await cacheSet(`submissions:user:${authorId}`, data)
      return data
    },

    // Votes
    votesBySubmission: async (_, { submissionId }) => {
      if (!mongoose.Types.ObjectId.isValid(submissionId)) throw new Error('Invalid submission ID')
      const cached = await cacheGet(`votes:submission:${submissionId}`)
      if (cached) return cached
      const data = await Vote.find({ submissionId })
      await cacheSet(`votes:submission:${submissionId}`, data)
      return data
    },

    votesByContest: async (_, { contestId }) => {
      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID')
      const cached = await cacheGet(`votes:contest:${contestId}`)
      if (cached) return cached
      const data = await Vote.find({ contestId })
      await cacheSet(`votes:contest:${contestId}`, data)
      return data
    },
  },

  // Relationship resolvers
  Contest: {
    id: (parent) => parent._id.toString(),
    createdBy: async (parent) => {
      return await User.findById(parent.createdBy)
    },
    submissions: async (parent) => {
      return await Submission.find({ contestId: parent._id }).sort({ totalScore: -1 })
    },
    submissionCount: async (parent) => {
      return await Submission.countDocuments({ contestId: parent._id })
    },
  },

  User: {
    id: (parent) => parent._id.toString(),
  },

  Submission: {
    id: (parent) => parent._id.toString(),
    contest: async (parent) => {
      return await Contest.findById(parent.contestId)
    },
    author: async (parent) => {
      return await User.findById(parent.authorId)
    },
    votes: async (parent) => {
      return await Vote.find({ submissionId: parent._id })
    },
  },

  Vote: {
    id: (parent) => parent._id.toString(),
    contest: async (parent) => {
      return await Contest.findById(parent.contestId)
    },
    submission: async (parent) => {
      return await Submission.findById(parent.submissionId)
    },
    voter: async (parent) => {
      return await User.findById(parent.voterId)
    },
  },

  Mutation: {
    // Create user
    createUser: async (_, { input }) => {
      const { firebaseUid, email, displayName } = input
      validateString(firebaseUid, 'firebaseUid')
      const validEmail = validateEmail(email)

      const existing = await User.findOne({ $or: [{ firebaseUid }, { email: validEmail }] })
      if (existing) throw new Error('User already exists with this firebaseUid or email')

      const user = await new User({
        firebaseUid: firebaseUid.trim(),
        email: validEmail,
        displayName: displayName?.trim() || null,
      }).save()

      await cacheFlush()
      return user
    },

    // Create contest
    createContest: async (_, { input }) => {
      const { title, prompt, rules, startTime, endTime, createdBy, votingType, votingDurationHours, wordMin, wordMax } = input

      validateString(title, 'title')
      validateString(prompt, 'prompt')
      const { start, end } = validateDates(startTime, endTime)
      validateWordLimits(wordMin, wordMax)

      if (!mongoose.Types.ObjectId.isValid(createdBy)) throw new Error('Invalid createdBy user ID')
      const creator = await User.findById(createdBy)
      if (!creator) throw new Error('Creator user not found')

      const validVotingType = votingType ? validateVotingType(votingType) : 'EVERYONE'

      const contest = await new Contest({
        title: title.trim(),
        prompt: prompt.trim(),
        rules: rules?.trim() || null,
        startTime: start,
        endTime: end,
        status: 'UPCOMING',
        createdBy,
        votingType: validVotingType,
        votingDurationHours: votingDurationHours || 48,
        wordMin: wordMin || null,
        wordMax: wordMax || null,
      }).save()

      await cacheFlush()
      return contest
    },

    // Update contest fields
    updateContest: async (_, { id, input }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID')
      const contest = await Contest.findById(id)
      if (!contest) throw new Error('Contest not found')

      const update = {}
      if (input.title) update.title = validateString(input.title, 'title')
      if (input.prompt) update.prompt = validateString(input.prompt, 'prompt')
      if (input.rules !== undefined) update.rules = input.rules?.trim() || null
      if (input.startTime || input.endTime) {
        const { start, end } = validateDates(
          input.startTime || contest.startTime,
          input.endTime || contest.endTime
        )
        if (input.startTime) update.startTime = start
        if (input.endTime) update.endTime = end
      }
      if (input.votingType) update.votingType = validateVotingType(input.votingType)
      if (input.votingDurationHours) update.votingDurationHours = input.votingDurationHours
      if (input.wordMin !== undefined || input.wordMax !== undefined) {
        validateWordLimits(
          input.wordMin ?? contest.wordMin,
          input.wordMax ?? contest.wordMax
        )
        if (input.wordMin !== undefined) update.wordMin = input.wordMin
        if (input.wordMax !== undefined) update.wordMax = input.wordMax
      }

      const updated = await Contest.findByIdAndUpdate(id, { $set: update }, { new: true })
      await cacheFlush()
      return updated
    },

    // Update contest status
    updateContestStatus: async (_, { id, status }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID')
      const validStatus = validateContestStatus(status)
      const contest = await Contest.findById(id)
      if (!contest) throw new Error('Contest not found')

      const updated = await Contest.findByIdAndUpdate(
        id,
        { $set: { status: validStatus } },
        { new: true }
      )
      await cacheFlush()
      return updated
    },

    // Delete contest
    deleteContest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID')
      const contest = await Contest.findById(id)
      if (!contest) throw new Error('Contest not found')

      // Remove all related submissions and votes
      const submissions = await Submission.find({ contestId: id })
      const submissionIds = submissions.map((s) => s._id)
      await Vote.deleteMany({ submissionId: { $in: submissionIds } })
      await Submission.deleteMany({ contestId: id })
      await Contest.findByIdAndDelete(id)

      await cacheFlush()
      return contest
    },

    // Create submission
    createSubmission: async (_, { input }) => {
      const { contestId, authorId, content, title, description } = input

      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID')
      if (!mongoose.Types.ObjectId.isValid(authorId)) throw new Error('Invalid author ID')
      validateString(content, 'content')

      const contest = await Contest.findById(contestId)
      if (!contest) throw new Error('Contest not found')
      if (contest.status !== 'ACTIVE') throw new Error('Contest is not currently active')

      const author = await User.findById(authorId)
      if (!author) throw new Error('Author user not found')

      const existing = await Submission.findOne({ contestId, authorId })
      if (existing) throw new Error('User has already submitted to this contest')

      const submission = await new Submission({
        contestId,
        authorId,
        content: content.trim(),
        title: title?.trim() || null,
        description: description?.trim() || null,
        submittedAt: new Date(),
        voteCount: 0,
        totalScore: 0,
      }).save()

      await cacheFlush()
      return submission
    },

    // Delete submission
    deleteSubmission: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid submission ID')
      const submission = await Submission.findById(id)
      if (!submission) throw new Error('Submission not found')

      await Vote.deleteMany({ submissionId: id })
      await Submission.findByIdAndDelete(id)

      await cacheFlush()
      return submission
    },

    // Cast vote
    castVote: async (_, { input }) => {
      const { contestId, submissionId, voterId, points } = input

      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID')
      if (!mongoose.Types.ObjectId.isValid(submissionId)) throw new Error('Invalid submission ID')
      if (!mongoose.Types.ObjectId.isValid(voterId)) throw new Error('Invalid voter ID')
      validatePoints(points)

      const contest = await Contest.findById(contestId)
      if (!contest) throw new Error('Contest not found')
      if (contest.status !== 'VOTING') throw new Error('Contest is not currently in voting phase')

      const submission = await Submission.findById(submissionId)
      if (!submission) throw new Error('Submission not found')
      if (submission.contestId.toString() !== contestId) throw new Error('Submission does not belong to this contest')

      const voter = await User.findById(voterId)
      if (!voter) throw new Error('Voter not found')

      // Cannot vote on own submission
      if (submission.authorId.toString() === voterId) throw new Error('Cannot vote on your own submission')

      // Check already voted on this submission
      const existingVote = await Vote.findOne({ submissionId, voterId })
      if (existingVote) throw new Error('You have already voted on this submission')

      const vote = await new Vote({
        contestId,
        submissionId,
        voterId,
        points,
        votedAt: new Date(),
      }).save()

      // Update submission score
      await Submission.findByIdAndUpdate(submissionId, {
        $inc: { voteCount: 1, totalScore: points },
      })

      await cacheFlush()
      return vote
    },

    // Finalize contest - rank submissions and assign placements
    finalizeContest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID')
      const contest = await Contest.findById(id)
      if (!contest) throw new Error('Contest not found')

      if (!['VOTING', 'JUDGING', 'CLOSED'].includes(contest.status)) {
        throw new Error('Contest must be in VOTING, JUDGING, or CLOSED status to finalize')
      }

      const submissions = await Submission.find({ contestId: id }).sort({ totalScore: -1 })

      // Assign placements and certificate URLs
      const updated = await Promise.all(
        submissions.map(async (sub, index) => {
          const placement = index + 1
          const certificateUrl = `/certs/${contest.title.replace(/\s+/g, '_').toLowerCase()}_${placement}_${sub._id}.pdf`
          return Submission.findByIdAndUpdate(
            sub._id,
            {
              $set: {
                placement,
                certificateUrl,
                certificateGeneratedAt: new Date(),
              },
            },
            { new: true }
          )
        })
      )

      const finalizedContest = await Contest.findByIdAndUpdate(
        id,
        { $set: { status: 'COMPLETED' } },
        { new: true }
      )

      await cacheFlush()
      return { contest: finalizedContest, submissions: updated }
    },
  },
}
