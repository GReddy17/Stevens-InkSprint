import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import Vote from '../models/Vote.js'
import { getContestStatus } from '../utils/helpers.js'
import { connectToMongo } from '../config/mongoConnection.js'

dotenv.config()

const seed = async () => {
  try {
    // Server already connected - skip duplicate connection
    console.log('Seeding existing connection...')

    await User.deleteMany({})
    await Contest.deleteMany({})
    await Submission.deleteMany({})
    await Vote.deleteMany({})
    console.log('Cleared existing data')

    const users = await User.create([
      { firebaseUid: 'u1', email: 'alex@school.edu', displayName: 'Alex Chen' },
      { firebaseUid: 'u2', email: 'jordan@school.edu', displayName: 'Jordan Lee' },
      { firebaseUid: 'u3', email: 'taylor@school.edu', displayName: 'Taylor Kim' },
      { firebaseUid: 'u4', email: 'sam@school.edu', displayName: 'Sam Patel' },
      { firebaseUid: 'u5', email: 'chris@school.edu', displayName: 'Chris Wong' },
      { firebaseUid: 'u6', email: 'jamie@school.edu', displayName: 'Jamie Rivera' },
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
        title: 'Stranger in Mirror',
        prompt: 'Your reflection changes.',
        votingType: 'EVERYONE',
        phase: 'COMPLETED',
        wordMin: 200,
        wordMax: 1200,
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

      const submissions = await Submission.create([
        {
          contestId: contest._id,
          authorId: users[1]._id,
          title: `${template.title} - Entry 1`,
          description: 'First submission for testing',
          content:
            'This is a sample story content for testing. A short tale of creativity.',
        },
        {
          contestId: contest._id,
          authorId: users[2]._id,
          title: `${template.title} - Entry 2`,
          description: 'Second submission for testing',
          content:
            'Another sample story for testing. Words flow like rivers in the night.',
        },
        {
          contestId: contest._id,
          authorId: users[5]._id,
          title: `${template.title} - Entry 3`,
          description: 'Third submission for testing',
          content:
            'A final sample story waits quietly, ready for another vote.',
        },
      ])

      totalSubmissions += submissions.length

      const status = getContestStatus(contest)

      if (status === 'ACTIVE' || status === 'UPCOMING') {
        console.log(`${contest.title}: ${status}, no votes seeded`)
        continue
      }

      let votesToCreate = []

      if (contest.votingType === 'JUDGES') {
        if (status === 'VOTING') {
          votesToCreate = [
            {
              contestId: contest._id,
              submissionId: submissions[0]._id,
              voterId: judgeUsers[0],
              points: 8,
              votedAt: new Date(),
            },
          ]
        }

        if (status === 'COMPLETED') {
          votesToCreate = [
            {
              contestId: contest._id,
              submissionId: submissions[0]._id,
              voterId: judgeUsers[0],
              points: 8,
              votedAt: new Date(),
            },
            {
              contestId: contest._id,
              submissionId: submissions[1]._id,
              voterId: judgeUsers[1],
              points: 7,
              votedAt: new Date(),
            },
          ]
        }
      }

      if (contest.votingType === 'CREATOR') {
        votesToCreate = [
          {
            contestId: contest._id,
            submissionId: submissions[0]._id,
            voterId: creator._id,
            points: 9,
            votedAt: new Date(),
          },
          {
            contestId: contest._id,
            submissionId: submissions[1]._id,
            voterId: creator._id,
            points: 6,
            votedAt: new Date(),
          },
        ]
      }

      if (contest.votingType === 'EVERYONE') {
        votesToCreate = [
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
        ]
      }

      if (votesToCreate.length > 0) {
        await Vote.create(votesToCreate)
        totalVotes += votesToCreate.length

        for (const vote of votesToCreate) {
          await Submission.findByIdAndUpdate(vote.submissionId, {
            $inc: {
              voteCount: 1,
              totalScore: vote.points,
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

    // Don't close connection - let server use it
    console.log('\nDatabase seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

if (process.env.SEED === 'true') {
  seed();
}