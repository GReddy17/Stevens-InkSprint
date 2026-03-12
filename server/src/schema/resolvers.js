import { contests } from '../data/mockData.js'

export const resolvers = {
  Query: {
    healthCheck: () => 'Ink Sprint GraphQL server is running',
    contests: () => contests,
    contest: (_, args) => {
      return contests.find((contest) => contest.id === args.id) || null
    }
  }
}