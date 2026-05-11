import mongoose from 'mongoose'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import admin from '../utils/firebaseAdmin.js'
import Vote from '../models/Vote.js'
import { getRedis } from '../config/redisClient.js'
import {
	validateString,
	validateEmail,
	validateContestStatus,
	validateVotingType,
	validateDates,
	validateWordLimits,
	validateCategoryScore,
} from '../utils/validation.js'
import { getContestStatus, finalizeContestIfNeeded } from '../utils/helpers.js'
import { generateCertificate } from '../utils/certificateGenerator.js'

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
		me: async (_, __, context) => {
			return context.user
		},
		users: async () => {
			return await User.find({})
		},

		user: async (_, { id }) => {
			if (!mongoose.Types.ObjectId.isValid(id))
				throw new Error('Invalid user ID')
			const user = await User.findById(id)
			if (!user) throw new Error('User not found')
			return user
		},

		// Contests
		contests: async () => {
			return await Contest.find({}).sort({ createdAt: -1 })
		},

		contest: async (_, { id }) => {
			if (!mongoose.Types.ObjectId.isValid(id))
				throw new Error('Invalid contest ID')

			const contest = await Contest.findById(id)
			if (!contest) throw new Error('Contest not found')

			await finalizeContestIfNeeded(contest)

			return contest
		},

		contestsByStatus: async (_, { status }) => {
			const validStatus = validateContestStatus(status)
			const contests = await Contest.find({}).sort({ createdAt: -1 })

			return contests.filter(
				(contest) => getContestStatus(contest) === validStatus,
			)
		},

		// Submissions
		submissions: async () => {
			return await Submission.find({}).sort({ submittedAt: -1 })
		},

		submission: async (_, { id }) => {
			if (!mongoose.Types.ObjectId.isValid(id))
				throw new Error('Invalid submission ID')

			const submission = await Submission.findById(id)
			if (!submission) throw new Error('Submission not found')

			const contest = await Contest.findById(submission.contestId)
			if (contest) {
				await finalizeContestIfNeeded(contest)
			}

			return await Submission.findById(id)
		},

		submissionsByContest: async (_, { contestId }) => {
			if (!mongoose.Types.ObjectId.isValid(contestId))
				throw new Error('Invalid contest ID')
			return await Submission.find({ contestId }).sort({ totalScore: -1 })
		},

		submissionsByUser: async (_, { authorId }) => {
			if (!mongoose.Types.ObjectId.isValid(authorId))
				throw new Error('Invalid user ID')
			return await Submission.find({ authorId }).sort({ submittedAt: -1 })
		},

		// Votes
		votesBySubmission: async (_, { submissionId }) => {
			if (!mongoose.Types.ObjectId.isValid(submissionId))
				throw new Error('Invalid submission ID')
			return await Vote.find({ submissionId })
		},

		votesByContest: async (_, { contestId }) => {
			if (!mongoose.Types.ObjectId.isValid(contestId))
				throw new Error('Invalid contest ID')
			return await Vote.find({ contestId })
		},
	},

	// Relationship resolvers
	Contest: {
		id: (parent) => parent._id.toString(),

		status: (parent) => {
			return getContestStatus(parent)
		},
		createdBy: async (parent) => {
			return await User.findById(parent.createdBy)
		},
		submissions: async (parent) => {
			return await Submission.find({ contestId: parent._id }).sort({
				totalScore: -1,
			})
		},
		submissionCount: async (parent) => {
			return await Submission.countDocuments({ contestId: parent._id })
		},
		votingGroupMembers: async (parent) => {
			return await User.find({
				_id: { $in: parent.votingGroupMemberIds || [] },
			})
		},
		startTime: (parent) =>
			parent.startTime instanceof Date
				? parent.startTime.getTime().toString()
				: parent.startTime?.toString(),
		endTime: (parent) =>
			parent.endTime instanceof Date
				? parent.endTime.getTime().toString()
				: parent.endTime?.toString(),
		votingStartTime: (parent) =>
			parent.votingStartTime instanceof Date
				? parent.votingStartTime.getTime().toString()
				: parent.votingStartTime?.toString(),
		votingEndTime: (parent) =>
			parent.votingEndTime instanceof Date
				? parent.votingEndTime.getTime().toString()
				: parent.votingEndTime?.toString(),
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
		averageStyleScore: (parent) =>
			parent.voteCount ? parent.styleScore / parent.voteCount : 0,
		averageCreativityScore: (parent) =>
			parent.voteCount ? parent.creativityScore / parent.voteCount : 0,
		averageStorytellingScore: (parent) =>
			parent.voteCount ? parent.storytellingScore / parent.voteCount : 0,
		averageTotalScore: (parent) =>
			parent.voteCount ? parent.totalScore / parent.voteCount : 0,
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

			const existing = await User.findOne({
				$or: [{ firebaseUid }, { email: validEmail }],
			})
			if (existing)
				throw new Error('User already exists with this firebaseUid or email')

			const user = await new User({
				firebaseUid: firebaseUid.trim(),
				email: validEmail,
				displayName: displayName?.trim() || null,
			}).save()

			return user
		},

		// Create contest
		createContest: async (_, { input }, context) => {
			if (!context.user)
				throw new Error('You must be logged in to create a contest')

			const {
				title,
				prompt,
				rules,
				startTime,
				endTime,
				votingType,
				votingGroupMemberIds,
				votingDurationHours,
				votingStartTime,
				votingEndTime,
				wordMin,
				wordMax,
			} = input

			validateString(title, 'title')
			validateString(prompt, 'prompt')
			const { start, end } = validateDates(startTime, endTime)
			validateWordLimits(wordMin, wordMax)

			const createdBy = context.user.id

			const validVotingType = votingType
				? validateVotingType(votingType)
				: 'EVERYONE'

			if (
				validVotingType === 'JUDGES' &&
				(!votingGroupMemberIds || votingGroupMemberIds.length === 0)
			) {
				throw new Error(
					'JUDGES votingType requires at least one votingGroupMemberId',
				)
			}

			if (votingGroupMemberIds && votingGroupMemberIds.length > 0) {
				const users = await User.find({ _id: { $in: votingGroupMemberIds } })

				if (users.length !== votingGroupMemberIds.length) {
					throw new Error('One or more votingGroupMemberIds are invalid users')
				}
			}

			let effectiveVotingDurationHours = votingDurationHours
			if (votingStartTime && votingEndTime) {
				const diffMs = new Date(votingEndTime) - new Date(votingStartTime)
				const diffHours = diffMs / (1000 * 60 * 60)
				effectiveVotingDurationHours = diffHours >= 1 ? Math.round(diffHours) : Math.ceil(diffHours)
			}

			const contest = await new Contest({
				title: title.trim(),
				prompt: prompt.trim(),
				rules: rules?.trim() || null,
				startTime: start,
				endTime: end,
				createdBy,
				votingType: validVotingType,
				votingGroupMemberIds: votingGroupMemberIds || [],
				votingDurationHours: effectiveVotingDurationHours || null,
				votingStartTime: votingStartTime ? new Date(votingStartTime) : null,
				votingEndTime: votingEndTime ? new Date(votingEndTime) : null,
				wordMin: wordMin || null,
				wordMax: wordMax || null,
			}).save()

			return contest
		},

		// Update contest fields
		updateContest: async (_, { id, input }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to update a contest')
			}
			if (!mongoose.Types.ObjectId.isValid(id)) {
				throw new Error('Invalid contest ID')
			}

			const contest = await Contest.findById(id)
			if (!contest) throw new Error('Contest not found')

			if (contest.createdBy.toString() !== context.user.id.toString()) {
				throw new Error('Only the contest creator can update this contest')
			}

			const update = {}
			if (input.title) update.title = validateString(input.title, 'title')
			if (input.prompt) update.prompt = validateString(input.prompt, 'prompt')
			if (input.rules !== undefined) update.rules = input.rules?.trim() || null
			if (input.startTime || input.endTime) {
				const { start, end } = validateDates(
					input.startTime || contest.startTime,
					input.endTime || contest.endTime,
				)
				if (input.startTime) update.startTime = start
				if (input.endTime) update.endTime = end
			}
			const newVotingType = input.votingType
				? validateVotingType(input.votingType)
				: contest.votingType

			if (input.votingType) update.votingType = newVotingType
			if (input.votingDurationHours)
				update.votingDurationHours = input.votingDurationHours
			if (input.votingStartTime !== undefined)
				update.votingStartTime = input.votingStartTime ? new Date(input.votingStartTime) : null
			if (input.votingEndTime !== undefined)
				update.votingEndTime = input.votingEndTime ? new Date(input.votingEndTime) : null
			if (input.wordMin !== undefined || input.wordMax !== undefined) {
				validateWordLimits(
					input.wordMin ?? contest.wordMin,
					input.wordMax ?? contest.wordMax,
				)
				if (input.wordMin !== undefined) update.wordMin = input.wordMin
				if (input.wordMax !== undefined) update.wordMax = input.wordMax
			}
			if (input.votingGroupMemberIds !== undefined) {
				if (input.votingGroupMemberIds.length > 0) {
					const users = await User.find({
						_id: { $in: input.votingGroupMemberIds },
					})

					if (users.length !== input.votingGroupMemberIds.length) {
						throw new Error(
							'One or more votingGroupMemberIds are invalid users',
						)
					}
				}

				update.votingGroupMemberIds = input.votingGroupMemberIds
			}

			const newVotingGroup =
				input.votingGroupMemberIds ?? contest.votingGroupMemberIds

			if (
				newVotingType === 'JUDGES' &&
				(!newVotingGroup || newVotingGroup.length === 0)
			) {
				throw new Error(
					'JUDGES votingType requires at least one votingGroupMemberId',
				)
			}

			if (newVotingType !== 'JUDGES') {
				update.votingGroupMemberIds = []
			}

			const updated = await Contest.findByIdAndUpdate(
				id,
				{ $set: update },
				{ returnDocument: 'after' },
			)
			return updated
		},

		// Delete contest
		deleteContest: async (_, { id }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to delete a contest')
			}

			if (!mongoose.Types.ObjectId.isValid(id)) {
				throw new Error('Invalid contest ID')
			}

			const contest = await Contest.findById(id)
			if (!contest) throw new Error('Contest not found')

			if (contest.createdBy.toString() !== context.user.id.toString()) {
				throw new Error('Only the contest creator can delete this contest')
			}

			const submissions = await Submission.find({ contestId: id })
			const submissionIds = submissions.map((s) => s._id)
			await Vote.deleteMany({ submissionId: { $in: submissionIds } })
			await Submission.deleteMany({ contestId: id })
			await Contest.findByIdAndDelete(id)

			return contest
		},

		// Create submission
		createSubmission: async (_, { input }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to submit')
			}

			const { contestId, content, title, description } = input
			const authorId = context.user.id

			if (!mongoose.Types.ObjectId.isValid(contestId))
				throw new Error('Invalid contest ID')
			validateString(content, 'content')

			const contest = await Contest.findById(contestId)
			if (!contest) throw new Error('Contest not found')
			const status = getContestStatus(contest)
			if (status !== 'ACTIVE')
				throw new Error('Contest is not currently active')

			const wordCount =
				content.trim() === '' ? 0 : content.trim().split(/\s+/).length

			if (contest.wordMin != null && wordCount < contest.wordMin) {
				throw new Error(`Submission must be at least ${contest.wordMin} words`)
			}

			if (contest.wordMax != null && wordCount > contest.wordMax) {
				throw new Error(`Submission cannot exceed ${contest.wordMax} words`)
			}

			const existing = await Submission.findOne({ contestId, authorId })
			if (existing)
				throw new Error('User has already submitted to this contest')

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

			return submission
		},

		// Delete submission
		deleteSubmission: async (_, { id }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to delete a submission')
			}
			if (!mongoose.Types.ObjectId.isValid(id)) {
				throw new Error('Invalid submission ID')
			}
			const submission = await Submission.findById(id)
			if (!submission) throw new Error('Submission not found')

			const contest = await Contest.findById(submission.contestId)
			if (!contest) throw new Error('Contest not found')

			const isAuthor =
				submission.authorId.toString() === context.user.id.toString()
			const isContestCreator =
				contest.createdBy.toString() === context.user.id.toString()

			if (!isAuthor && !isContestCreator) {
				throw new Error('You are not authorized to delete this submission')
			}

			await Vote.deleteMany({ submissionId: id })
			await Submission.findByIdAndDelete(id)

			return submission
		},

		// Cast vote
		castVote: async (_, { input }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to vote')
			}

			const {
				contestId,
				submissionId,
				styleScore,
				creativityScore,
				storytellingScore,
			} = input
			const voterId = context.user.id

			validateCategoryScore(styleScore, 'styleScore')
			validateCategoryScore(creativityScore, 'creativityScore')
			validateCategoryScore(storytellingScore, 'storytellingScore')

			const totalScore = styleScore + creativityScore + storytellingScore

			if (!mongoose.Types.ObjectId.isValid(contestId))
				throw new Error('Invalid contest ID')
			if (!mongoose.Types.ObjectId.isValid(submissionId))
				throw new Error('Invalid submission ID')

			const contest = await Contest.findById(contestId)
			if (!contest) throw new Error('Contest not found')
			const status = getContestStatus(contest)
			if (status !== 'VOTING')
				throw new Error('Contest is not currently in voting phase')

			const submission = await Submission.findById(submissionId)
			if (!submission) throw new Error('Submission not found')
			if (submission.contestId.toString() !== contestId)
				throw new Error('Submission does not belong to this contest')

			const voter = await User.findById(voterId)
			if (!voter) throw new Error('Voter not found')

			if (contest.votingType === 'JUDGES') {
				if (
					!contest.votingGroupMemberIds.some((id) => id.toString() === voterId)
				) {
					throw new Error('You are not authorized to vote in this contest')
				}
			}

			if (contest.votingType === 'CREATOR') {
				if (contest.createdBy.toString() !== voterId) {
					throw new Error('Only the contest creator can vote')
				}
			}

			if (submission.authorId.toString() === voterId)
				throw new Error('Cannot vote on your own submission')

			const existingVote = await Vote.findOne({ submissionId, voterId })
			if (existingVote)
				throw new Error('You have already voted on this submission')

			const vote = await new Vote({
				contestId,
				submissionId,
				voterId,
				styleScore,
				creativityScore,
				storytellingScore,
				totalScore,
				votedAt: new Date(),
			}).save()

			await Submission.findByIdAndUpdate(submissionId, {
				$inc: {
					voteCount: 1,
					styleScore,
					creativityScore,
					storytellingScore,
					totalScore,
				},
			})

			return vote
		},

		// Finalize contest - rank submissions and assign placements
		finalizeContest: async (_, { id }, context) => {
			if (!context.user) {
				throw new Error('You must be logged in to finalize a contest')
			}

			if (!mongoose.Types.ObjectId.isValid(id)) {
				throw new Error('Invalid contest ID')
			}

			const contest = await Contest.findById(id)
			if (!contest) throw new Error('Contest not found')

			if (contest.createdBy.toString() !== context.user.id.toString()) {
				throw new Error('Only the contest creator can finalize this contest')
			}

			const status = getContestStatus(contest)

			if (status !== 'COMPLETED') {
				throw new Error(
					'Contest voting period must be completed before finalizing',
				)
			}

			const submissions = await finalizeContestIfNeeded(contest)

			return { contest, submissions }
		},
	},
}
