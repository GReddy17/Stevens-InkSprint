import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import { generateCertificate } from './certificateGenerator.js'

// Get dynamic contest status based on startTime/endTime
export function getContestStatus(contest) {
	const now = new Date()
	const startTime = new Date(contest.startTime)
	const endTime = new Date(contest.endTime)

	const votingStartTime = contest.votingStartTime ? new Date(contest.votingStartTime) : null
	const votingEndTime = contest.votingEndTime ? new Date(contest.votingEndTime) : null

	if (now < startTime) return 'UPCOMING'
	if (now <= endTime) return 'ACTIVE'
	if (votingStartTime && now < votingStartTime) return 'ACTIVE'
	if (votingStartTime && votingEndTime && now >= votingStartTime && now <= votingEndTime) return 'VOTING'
	if (!votingStartTime || !votingEndTime) return 'COMPLETED'
	return 'COMPLETED'
}

// Finalize contest if contest is fetched after the voting period
export const finalizeContestIfNeeded = async (contest) => {
	const status = getContestStatus(contest)

	if (status !== 'COMPLETED') {
		return []
	}

	const submissions = await Submission.find({ contestId: contest._id })

	if (submissions.length === 0) {
		return []
	}

	const alreadyFinalized = submissions.every(
		(sub) => sub.placement != null && sub.certificateUrl,
	)

	if (alreadyFinalized) {
		return submissions
	}

	submissions.sort((a, b) => {
		const averageA = a.voteCount ? a.totalScore / a.voteCount : 0
		const averageB = b.voteCount ? b.totalScore / b.voteCount : 0

		return averageB - averageA
	})

	const finalizedAt = new Date()
	const certificateDate = finalizedAt.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return await Promise.all(
		submissions.map(async (sub, index) => {
			const placement = index + 1
			const author = await User.findById(sub.authorId)
			const authorName = author?.displayName || author?.email || 'Participant'

			const certificateUrl = await generateCertificate({
				contestTitle: contest.title,
				participantName: authorName,
				placement,
				date: certificateDate,
				submissionId: sub._id.toString(),
			})

			return Submission.findByIdAndUpdate(
				sub._id,
				{
					$set: {
						placement,
						certificateUrl,
						certificateGeneratedAt: finalizedAt,
					},
				},
				{ returnDocument: 'after' },
			)
		}),
	)
}
