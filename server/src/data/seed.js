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

    // USERS
    const users = await User.create([
      { firebaseUid: 'u1', email: 'alex@school.edu', displayName: 'Alex Chen' },
      { firebaseUid: 'u2', email: 'jordan@school.edu', displayName: 'Jordan Lee' },
      { firebaseUid: 'u3', email: 'taylor@school.edu', displayName: 'Taylor Kim' },
      { firebaseUid: 'u4', email: 'sam@school.edu', displayName: 'Sam Patel' },
      { firebaseUid: 'u5', email: 'chris@school.edu', displayName: 'Chris Wong' },
      { firebaseUid: 'u6', email: 'jamie@school.edu', displayName: 'Jamie Rivera' },
    ])

    console.log(`Created ${users.length} users`)

    const contestTemplates = [
      { title: 'Midnight Horror', prompt: 'Something follows you home.', wordMin: 100, wordMax: 1000 },
      { title: 'Lost in Time', prompt: 'A character wakes up 100 years later.', wordMin: 200, wordMax: 1500 },
      { title: 'Hidden Door', prompt: "You find a door that shouldn't exist.", wordMin: 150, wordMax: 1200 },
      { title: 'Final Message', prompt: 'The last message on Earth.', wordMin: 50, wordMax: 500 },
      { title: 'The Storm', prompt: 'A storm that never ends.', wordMin: 100, wordMax: 800 },
      { title: 'Echoes', prompt: 'You hear your own voice calling back.', wordMin: 100, wordMax: 1000 },
      { title: 'Stranger in Mirror', prompt: 'Your reflection changes.', wordMin: 200, wordMax: 1200 },
      { title: 'The Package', prompt: 'A mysterious delivery arrives.', wordMin: 150, wordMax: 1000 },
      { title: 'Parallel Life', prompt: 'You meet yourself.', wordMin: 200, wordMax: 1500 },
      { title: 'Vanishing Town', prompt: 'People disappear overnight.', wordMin: 250, wordMax: 2000 },
    ]

    const statuses = ['UPCOMING', 'ACTIVE', 'VOTING', 'COMPLETED']

    let totalSubmissions = 0
    let totalVotes = 0

    for (let i = 0; i < contestTemplates.length; i++) {
      const template = contestTemplates[i]

      const contest = await Contest.create({
        title: template.title,
        prompt: template.prompt,
        rules: 'Original work only. No AI-generated content.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: statuses[i % statuses.length],
        createdBy: users[0]._id,
        votingType: 'EVERYONE',
        votingDurationHours: 48,
        wordMin: template.wordMin,
        wordMax: template.wordMax,
      })

      const submissions = await Submission.create([
        {
          contestId: contest._id,
          authorId: users[(i + 1) % users.length]._id,
          title: `${template.title} - Entry 1`,
          description: 'First submission for testing',
          content: 'This is a sample story content for testing. A short tale of creativity.',
        },
        {
          contestId: contest._id,
          authorId: users[(i + 2) % users.length]._id,
          title: `${template.title} - Entry 2`,
          description: 'Second submission for testing',
          content: 'Another sample story for testing. Words flow like rivers in the night.',
        },
      ])

      totalSubmissions += submissions.length

      if (contest.status === 'COMPLETED' || contest.status === 'VOTING') {
        const votes = await Vote.create([
          {
            contestId: contest._id,
            submissionId: submissions[0]._id,
            voterId: users[3]._id,
            points: 8,
            votedAt: new Date(),
          },
          {
            contestId: contest._id,
            submissionId: submissions[1]._id,
            voterId: users[4]._id,
            points: 7,
            votedAt: new Date(),
          },
        ])

        totalVotes += votes.length

        await Submission.findByIdAndUpdate(submissions[0]._id, {
          voteCount: 1,
          totalScore: 8,
        })

        await Submission.findByIdAndUpdate(submissions[1]._id, {
          voteCount: 1,
          totalScore: 7,
        })
      }
    }

    console.log('\n--- Seed Summary ---')
    console.log(`Users: ${users.length}`)
    console.log(`Contests: ${contestTemplates.length}`)
    console.log(`Submissions: ${totalSubmissions}`)
    console.log(`Votes: ${totalVotes}`)

    await mongoose.connection.close()
    console.log('\nDatabase seeded successfully!')
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()