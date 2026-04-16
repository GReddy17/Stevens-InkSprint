export const typeDefs = `#graphql
  type Contest {
    id: ID!
    title: String!
    prompt: String!
    rules: String
    wordLimit: Number!
    startTime: String!
    endTime: String!
    status: String!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    firebaseUid: String!
    email: String!
    displayName: String
    createdAt: String!
    updatedAt: String!
  }

input CreateContestInput {
  title: String!
  prompt: String!
  rules: String
  wordLimit: Number!
  startTime: String!
  endTime: String!
  createdBy: ID!
  votingMode: String
  judges: [ID!]
}

  input CreateUserInput {
    firebaseUid: String!
    email: String!
    displayName: String
  }

  type Query {
    healthCheck: String!
    contests: [Contest!]!
    contest(id: ID!): Contest
  }

  type Mutation {
    createContest(input: CreateContestInput!): Contest!
    createUser(input: CreateUserInput!): User!
  }
`