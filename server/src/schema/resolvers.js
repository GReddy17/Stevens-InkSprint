import Contest from '../models/Contest.js'
import User from '../models/User.js'
import { contests as mockContests } from '../data/mockData.js'

export const resolvers = {
  Query: {
    healthCheck: () => 'Ink Sprint GraphQL server is running',

    contests: async () => {
      try {
        return await Contest.find({})
      } catch (error) {
        console.error('Error fetching contests:', error.message)
        return mockContests
      }
    },

    contest: async (_, args) => {
      try {
        return await Contest.findById(args.id)
      } catch (error) {
        console.error('Error fetching contest:', error.message)
        return null
      }
    },
  },

  Mutation: {
    createContest: async (_, args) => {
      try {
        const { title, prompt, rules, startTime, endTime, createdBy } = args.input

        const newContest = new Contest({
          title,
          prompt,
          rules,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          createdBy,
        })

        const savedContest = await newContest.save()
        return savedContest
      } catch (error) {
        console.error('Error creating contest:', error.message)
        throw new Error('Failed to create contest')
      }
    },

    createUser: async (_, args) => {
      try {
        const { firebaseUid, email, displayName, role } = args.input

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
          role: role || 'PARTICIPANT',
        })

        const savedUser = await newUser.save()
        return savedUser
      } catch (error) {
        console.error('Error creating user:', error.message)
        throw error
      }
    },
  },
}