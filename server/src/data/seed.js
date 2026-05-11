import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import Vote from '../models/Vote.js'
import { getContestStatus } from '../utils/helpers.js'
import { connectToMongo } from '../config/mongoConnection.js'
import { generateCertificate } from '../utils/certificateGenerator.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CERTS_DIR = path.resolve(__dirname, '..', '..', 'public', 'certs')

const clearGeneratedCertificates = () => {
	if (!fs.existsSync(CERTS_DIR)) {
		fs.mkdirSync(CERTS_DIR, { recursive: true })
		return
	}

	for (const file of fs.readdirSync(CERTS_DIR)) {
		if (file.endsWith('.png')) {
			fs.unlinkSync(path.join(CERTS_DIR, file))
		}
	}
}

dotenv.config()

const formatCertificateDate = (date) =>
	date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

const assignPlacementWithCertificate = async ({
	submission,
	contestTitle,
	placement,
	generatedAt,
}) => {
	const author = await User.findById(submission.authorId)
	const participantName = author?.displayName || author?.email || 'Participant'

	const certificateUrl = await generateCertificate({
		contestTitle,
		participantName,
		placement,
		date: formatCertificateDate(generatedAt),
		submissionId: submission._id.toString(),
	})

	await Submission.findByIdAndUpdate(submission._id, {
		$set: {
			placement,
			certificateUrl,
			certificateGeneratedAt: generatedAt,
		},
	})

	return certificateUrl
}

const seed = async () => {
	try {
		await connectToMongo()
		console.log('Seeding...')

		await User.deleteMany({})
		await Contest.deleteMany({})
		await Submission.deleteMany({})
		await Vote.deleteMany({})
		console.log('Cleared existing data')
		clearGeneratedCertificates()
		console.log('Cleared generated certificates')

		const users = await User.create([
			{ firebaseUid: 'u1', email: 'alex@school.edu', displayName: 'Alex Chen' },
			{
				firebaseUid: 'u2',
				email: 'jordan@school.edu',
				displayName: 'Jordan Lee',
			},
			{
				firebaseUid: 'u3',
				email: 'taylor@school.edu',
				displayName: 'Taylor Kim',
			},
			{ firebaseUid: 'u4', email: 'sam@school.edu', displayName: 'Sam Patel' },
			{
				firebaseUid: 'u5',
				email: 'chris@school.edu',
				displayName: 'Chris Wong',
			},
			{
				firebaseUid: 'u6',
				email: 'jamie@school.edu',
				displayName: 'Jamie Rivera',
			},
		])

		console.log(`Created ${users.length} users`)

		const creator = users[0]
		const judgeUsers = [users[3]._id, users[4]._id]

		const now = Date.now()
		const day = 24 * 60 * 60 * 1000

		const datePatterns = {
			UPCOMING: {
				startTime: new Date(now + 2 * day),
				endTime: new Date(now + 5 * day),
			},
			ACTIVE: {
				startTime: new Date(now - 1 * day),
				endTime: new Date(now + 2 * day),
			},
			VOTING: {
				startTime: new Date(now - 5 * day),
				endTime: new Date(now - 1 * day),
			},
			COMPLETED: {
				startTime: new Date(now - 10 * day),
				endTime: new Date(now - 5 * day),
			},
		}

		const contestTemplates = [
			{
				title: 'Midnight Horror',
				prompt: 'Something follows you home.',
				votingType: 'EVERYONE',
				phase: 'UPCOMING',
				wordMin: 100,
				wordMax: 1000,
			},
			{
				title: 'Lost in Time',
				prompt: 'A character wakes up 100 years later.',
				votingType: 'JUDGES',
				phase: 'VOTING',
				wordMin: 200,
				wordMax: 1500,
			},
			{
				title: 'Hidden Door',
				prompt: "You find a door that shouldn't exist.",
				votingType: 'CREATOR',
				phase: 'VOTING',
				wordMin: 150,
				wordMax: 1200,
			},
			{
				title: 'Final Message',
				prompt: 'The last message on Earth.',
				votingType: 'EVERYONE',
				phase: 'ACTIVE',
				wordMin: 50,
				wordMax: 500,
			},
			{
				title: 'The Storm',
				prompt: 'A storm that never ends.',
				votingType: 'JUDGES',
				phase: 'ACTIVE',
				wordMin: 100,
				wordMax: 800,
			},
			{
				title: 'Echoes',
				prompt: 'You hear your own voice calling back.',
				votingType: 'CREATOR',
				phase: 'COMPLETED',
				wordMin: 100,
				wordMax: 1000,
			},
			{
				title: 'The Package',
				prompt: 'A mysterious delivery arrives.',
				votingType: 'JUDGES',
				phase: 'COMPLETED',
				wordMin: 150,
				wordMax: 1000,
			},
			{
				title: 'Parallel Life',
				prompt: 'You meet yourself.',
				votingType: 'CREATOR',
				phase: 'UPCOMING',
				wordMin: 200,
				wordMax: 1500,
			},
			{
				title: 'Vanishing Town',
				prompt: 'People disappear overnight.',
				votingType: 'EVERYONE',
				phase: 'VOTING',
				wordMin: 250,
				wordMax: 2000,
			},
		]

		const scoreSets = [
			{ styleScore: 5, creativityScore: 2, storytellingScore: 4 },
			{ styleScore: 2, creativityScore: 5, storytellingScore: 5 },
			{ styleScore: 4, creativityScore: 3, storytellingScore: 2 },
			{ styleScore: 3, creativityScore: 4, storytellingScore: 5 },
		]

		const buildVote = ({ contestId, submissionId, voterId, scores }) => {
			const totalScore =
				scores.styleScore + scores.creativityScore + scores.storytellingScore

			return {
				contestId,
				submissionId,
				voterId,
				...scores,
				totalScore,
				votedAt: new Date(),
			}
		}

		let totalSubmissions = 0
		let totalVotes = 0

		for (const template of contestTemplates) {
			const { startTime, endTime } = datePatterns[template.phase]
			const votingGroupMemberIds =
				template.votingType === 'JUDGES' ? judgeUsers : []

			const contest = await Contest.create({
				title: template.title,
				prompt: template.prompt,
				rules: 'Original work only. No AI-generated content.',
				startTime,
				endTime,
				createdBy: creator._id,
				votingType: template.votingType,
				votingDurationHours: 48,
				votingGroupMemberIds,
				wordMin: template.wordMin,
				wordMax: template.wordMax,
			})

			const status = getContestStatus(contest)

			if (status === 'UPCOMING') {
				console.log(
					`${contest.title}: ${status}, no submissions or votes seeded`,
				)
				continue
			}

			const submissions = await Submission.create([
				{
					contestId: contest._id,
					authorId: users[1]._id,
					title: `${template.title} - Entry 1`,
					description: 'First submission for testing',
					content:
						'This is a sample story content for testing. A short tale of creativity.',
					voteCount: 0,
					styleScore: 0,
					creativityScore: 0,
					storytellingScore: 0,
					totalScore: 0,
				},
				{
					contestId: contest._id,
					authorId: users[2]._id,
					title: `${template.title} - Entry 2`,
					description: 'Second submission for testing',
					content:
						'Another sample story for testing. Words flow like rivers in the night.',
					voteCount: 0,
					styleScore: 0,
					creativityScore: 0,
					storytellingScore: 0,
					totalScore: 0,
				},
				{
					contestId: contest._id,
					authorId: users[5]._id,
					title: `${template.title} - Entry 3`,
					description: 'Third submission for testing',
					content:
						'A final sample story waits quietly, ready for another vote.',
					voteCount: 0,
					styleScore: 0,
					creativityScore: 0,
					storytellingScore: 0,
					totalScore: 0,
				},
			])

			totalSubmissions += submissions.length

			if (status === 'ACTIVE') {
				console.log(
					`${contest.title}: ${status}, submissions seeded, no votes seeded`,
				)
				continue
			}

			let votesToCreate = []

			if (contest.votingType === 'JUDGES') {
				if (status === 'VOTING') {
					votesToCreate = [
						buildVote({
							contestId: contest._id,
							submissionId: submissions[0]._id,
							voterId: judgeUsers[0],
							scores: scoreSets[0],
						}),
					]
				}

				if (status === 'COMPLETED') {
					votesToCreate = [
						buildVote({
							contestId: contest._id,
							submissionId: submissions[0]._id,
							voterId: judgeUsers[0],
							scores: scoreSets[0],
						}),
						buildVote({
							contestId: contest._id,
							submissionId: submissions[1]._id,
							voterId: judgeUsers[1],
							scores: scoreSets[1],
						}),
					]
				}
			}

			if (contest.votingType === 'CREATOR') {
				votesToCreate = [
					buildVote({
						contestId: contest._id,
						submissionId: submissions[0]._id,
						voterId: creator._id,
						scores: scoreSets[2],
					}),
					buildVote({
						contestId: contest._id,
						submissionId: submissions[1]._id,
						voterId: creator._id,
						scores: scoreSets[3],
					}),
				]
			}

			if (contest.votingType === 'EVERYONE') {
				votesToCreate = [
					buildVote({
						contestId: contest._id,
						submissionId: submissions[0]._id,
						voterId: users[3]._id,
						scores: scoreSets[0],
					}),
					buildVote({
						contestId: contest._id,
						submissionId: submissions[1]._id,
						voterId: users[4]._id,
						scores: scoreSets[1],
					}),
				]
			}

			if (votesToCreate.length > 0) {
				await Vote.create(votesToCreate)
				totalVotes += votesToCreate.length

				for (const vote of votesToCreate) {
					await Submission.findByIdAndUpdate(vote.submissionId, {
						$inc: {
							voteCount: 1,
							styleScore: vote.styleScore,
							creativityScore: vote.creativityScore,
							storytellingScore: vote.storytellingScore,
							totalScore: vote.totalScore,
						},
					})
				}
			}
		}

		console.log('\n--- Seed Summary ---')
		console.log(`Users: ${users.length}`)
		console.log(`Creator: ${creator.displayName}`)
		console.log(`Judges: ${users[3].displayName}, ${users[4].displayName}`)
		console.log(`Contests: ${contestTemplates.length}`)
		console.log(`Submissions: ${totalSubmissions}`)
		console.log(`Votes: ${totalVotes}`)

		const echoSubmissions = await Submission.find({
			title: { $regex: 'Echoes' },
		}).sort({ totalScore: -1 })

		for (let i = 0; i < echoSubmissions.length; i++) {
			await assignPlacementWithCertificate({
				submission: echoSubmissions[i],
				contestTitle: 'Echoes',
				placement: i + 1,
				generatedAt: new Date(`2026-05-0${i + 1}`),
			})
		}

		console.log(`Seeded: ${echoSubmissions.length} Echoes certificates`)

		const packageSubmissions = await Submission.find({
			title: { $regex: 'The Package' },
		}).sort({ totalScore: -1 })

		for (let i = 0; i < packageSubmissions.length; i++) {
			await assignPlacementWithCertificate({
				submission: packageSubmissions[i],
				contestTitle: 'The Package',
				placement: i + 1,
				generatedAt: new Date('2026-04-28'),
			})
		}

		console.log(`Seeded: ${packageSubmissions.length} The Package certificates`)

		console.log('\nDatabase seeded successfully!')
	} catch (error) {
		console.error('Seed error:', error)
		throw error
	}
}

seed()
	.then(async () => {
		await mongoose.connection.close()
		console.log('MongoDB connection closed')
		process.exit(0)
	})
	.catch(async (error) => {
		console.error('Seed error:', error)
		await mongoose.connection.close()
		process.exit(1)
	})
