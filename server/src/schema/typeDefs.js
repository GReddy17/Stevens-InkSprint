export const typeDefs = `#graphql
  enum VotingMode {
    PUBLIC
    PARTICIPANTS_ONLY
    JUDGES_ONLY
  }

  type Contest {
    id: ID!
    title: String!
    prompt: String!
    rules: String
    wordLimit: Int!
    votingMode: VotingMode!
    judges: [ID!]!
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
  wordLimit: Int!
  votingMode: VotingMode
  judges: [ID!]
  startTime: String!
  endTime: String!
  createdBy: ID!
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
