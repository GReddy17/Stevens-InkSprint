import Contest from '../models/Contest.js'
import User from '../models/User.js'
import Submission from '../models/Submission.js'

function serializeDates(document, dateFields) {
	if (!document) return null

	const plainDocument =
		typeof document.toObject === 'function'
			? document.toObject()
			: { ...document }

	if (!plainDocument.id && plainDocument._id) {
		plainDocument.id = plainDocument._id.toString()
	}

	for (const field of dateFields) {
		if (plainDocument[field] instanceof Date) {
			plainDocument[field] = plainDocument[field].toISOString()
		}
	}

	return plainDocument
}

function serializeDatesForList(documents, dateFields) {
	return documents.map((document) => serializeDates(document, dateFields))
}

export const resolvers = {
	Query: {
		healthCheck: () => 'Ink Sprint GraphQL server is running',

		users: async () => {
			try {
				return await User.find({})
			} catch (error) {
				console.error('Error fetching users:', error.message)
				throw new Error('Failed to fetch users')
			}
		},

		contests: async () => {
			try {
				const contests = await Contest.find({})
				return serializeDatesForList(contests, [
					'startTime',
					'endTime',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error fetching contests:', error.message)
				throw new Error('Failed to fetch contests')
			}
		},

		contest: async (_, args) => {
			try {
				const contest = await Contest.findById(args.id)
				return serializeDates(contest, [
					'startTime',
					'endTime',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error fetching contest:', error.message)
				return null
			}
		},

		submission: async (_, args) => {
			try {
				const submission = await Submission.findById(args.id)
				return serializeDates(submission, [
					'submittedAt',
					'certificateGeneratedAt',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error fetching submission:', error.message)
				return null
			}
		},

		submissionsByContest: async (_, args) => {
			try {
				const submissions = await Submission.find({
					contestId: args.contestId,
				}).sort({
					submittedAt: -1,
				})

				return serializeDatesForList(submissions, [
					'submittedAt',
					'certificateGeneratedAt',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error fetching submissions:', error.message)
				throw new Error('Failed to fetch submissions')
			}
		},
	},

	Mutation: {
		createContest: async (_, args) => {
			try {
				const {
					title,
					prompt,
					rules,
					startTime,
					endTime,
					createdBy,
					votingType,
					votingDurationHours,
					votingGroupMemberIds,
					wordMin,
					wordMax,
				} = args.input

				const newContest = new Contest({
					title,
					prompt,
					rules,
					startTime: new Date(startTime),
					endTime: new Date(endTime),
					createdBy,
					votingType: votingType || 'EVERYONE',
					votingDurationHours: votingDurationHours ?? 48,
					votingGroupMemberIds: votingGroupMemberIds || [],
					wordMin: wordMin ?? null,
					wordMax: wordMax ?? null,
				})

				const savedContest = await newContest.save()

				return serializeDates(savedContest, [
					'startTime',
					'endTime',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error creating contest:', error.message)
				throw new Error('Failed to create contest')
			}
		},

		createUser: async (_, args) => {
			try {
				const { firebaseUid, email, displayName } = args.input

				const existingUser = await User.findOne({
					$or: [{ firebaseUid }, { email }],
				})

				if (existingUser) {
					throw new Error('User already exists')
				}

				const newUser = new User({
					firebaseUid,
					email,
					displayName,
				})

				const savedUser = await newUser.save()

				return serializeDates(savedUser, ['createdAt', 'updatedAt'])
			} catch (error) {
				console.error('Error creating user:', error.message)
				throw error
			}
		},

		createSubmission: async (_, args) => {
			try {
				const { contestId, authorId, title, description, content } = args.input

				const newSubmission = new Submission({
					contestId,
					authorId,
					title,
					description,
					content,
				})

				const savedSubmission = await newSubmission.save()

				return serializeDates(savedSubmission, [
					'submittedAt',
					'certificateGeneratedAt',
					'createdAt',
					'updatedAt',
				])
			} catch (error) {
				console.error('Error creating submission:', error)

				if (error.code === 11000) {
					throw new Error('You have already submitted to this contest')
				}

				throw new Error('Failed to create submission')
			}
		},
	},
  Submission: {
    author: async (parent) => {
      try {
        return await User.findById(parent.authorId)
      } catch (error) {
        console.error('Error fetching author:', error.message)
        return null
      }
    },
  },
}
