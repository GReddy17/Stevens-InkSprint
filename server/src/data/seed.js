import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import Vote from '../models/Vote.js'
import { connectToMongo } from '../config/mongoConnection.js'

dotenv.config()

const seed = async () => {
	try {
		await connectToMongo()
		console.log('Connected to MongoDB')

		await User.deleteMany({})
		await Contest.deleteMany({})
		await Submission.deleteMany({})
		await Vote.deleteMany({})
		console.log('Cleared existing data')

		// 1. Users
		const users = await User.create([
			{
				firebaseUid: 'firebase_alex123',
				email: 'alex@school.edu',
				displayName: 'Alex Chen',
				role: 'PARTICIPANT',
				votingWeight: 1,
			},
			{
				firebaseUid: 'firebase_jordan456',
				email: 'jordan@school.edu',
				displayName: 'Jordan Lee',
				role: 'PARTICIPANT',
				votingWeight: 1,
			},
			{
				firebaseUid: 'firebase_taylor789',
				email: 'taylor@school.edu',
				displayName: 'Taylor Kim',
				role: 'PARTICIPANT',
				votingWeight: 1,
			},
		])
		console.log(`Created ${users.length} users`)

		// 2. Contest
		const contest = await Contest.create({
			title: 'Horror Story Challenge',
			prompt: 'Write a scary story under 1000 words',
			rules: 'Original work only. No AI-generated content.',
			startTime: new Date('2026-10-01'),
			endTime: new Date('2026-10-07'),
			status: 'COMPLETED',
			createdBy: users[0]._id,
			votingType: 'EVERYONE',
			votingDurationHours: 48,
			votingGroupMemberIds: [],
		})
		console.log('Created 1 contest')

		// 3. Submissions
		const submissions = await Submission.create([
			{
				contestId: contest._id,
				authorId: users[1]._id,
				content:
					'The basement door had never quite closed right. Even when latched, it breathed—slow, wooden sighs that rose through the house after midnight. I used to think it was just the furnace kicking on, or the pipes settling. That was before I found the second set of footprints in the dust at the bottom of the stairs. They weren’t mine. They weren’t old either. Each step was sharp, deliberate, as if whatever made them had paused halfway up, listening… the same way I was now.',
				title: 'The Basement',
				description: "A story about what's underneath",
				submittedAt: new Date('2026-10-03'),
				voteCount: 0,
				totalScore: 0,
				placement: 1,
				certificateUrl: '/certs/horror_1_jordan.pdf',
				certificateGeneratedAt: new Date('2026-10-09'),
			},
			{
				contestId: contest._id,
				authorId: users[2]._id,
				content:
					'At 3AM, the world feels like it forgot about you. The house is too quiet, the kind of quiet that hums in your ears if you listen too long. I checked my phone again—3:00, exactly, like it had been the last four times. No notifications, no messages, just the glow of the screen lighting up the ceiling. I told myself to roll over, to close my eyes, but something felt off. Like the silence wasn’t empty at all. Like it was waiting for me to notice it.',
				title: '3AM',
				description: "Can't sleep",
				submittedAt: new Date('2026-10-05'),
				voteCount: 0,
				totalScore: 0,
				placement: 2,
				certificateUrl: '/certs/horror_2_taylor.pdf',
				certificateGeneratedAt: new Date('2026-10-09'),
			},
		])
		console.log(`Created ${submissions.length} submissions`)

		// 4. Votes
		await Vote.create([
			{
				contestId: contest._id,
				submissionId: submissions[0]._id,
				voterId: users[0]._id,
				points: 8,
				votedAt: new Date('2026-10-08'),
			},
			{
				contestId: contest._id,
				submissionId: submissions[0]._id,
				voterId: users[2]._id,
				points: 9,
				votedAt: new Date('2026-10-08'),
			},
			{
				contestId: contest._id,
				submissionId: submissions[1]._id,
				voterId: users[0]._id,
				points: 7,
				votedAt: new Date('2026-10-08'),
			},
			{
				contestId: contest._id,
				submissionId: submissions[1]._id,
				voterId: users[1]._id,
				points: 8,
				votedAt: new Date('2026-10-08'),
			},
		])
		console.log('Created 4 votes')

		// Update submission scores (17 = 8+9, 15 = 7+8)
		await Submission.findByIdAndUpdate(submissions[0]._id, {
			voteCount: 2,
			totalScore: 17,
		})
		await Submission.findByIdAndUpdate(submissions[1]._id, {
			voteCount: 2,
			totalScore: 15,
		})

		console.log('\n--- Seed Summary ---')
		console.log(`Users: ${users.length}`)
		console.log(`Contests: 1`)
		console.log(`Submissions: ${submissions.length}`)
		console.log(`Votes: 4`)

		await mongoose.connection.close()
		console.log('\nDatabase seeded successfully!')
	} catch (error) {
		console.error('Seed error:', error)
		process.exit(1)
	}
}

seed()
