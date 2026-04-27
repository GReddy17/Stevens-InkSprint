export const typeDefs = `#graphql
  enum ContestStatus {
    UPCOMING
    ACTIVE
    CLOSED
    VOTING
    JUDGING
    COMPLETED
  }

  enum VotingType {
    EVERYONE
    JUDGES
    CREATOR
  }

  type Contest {
    id: ID!
    title: String!
    prompt: String!
    rules: String
    startTime: String!
    endTime: String!
    status: ContestStatus!
    createdBy: ID!
    votingType: VotingType!
    votingDurationHours: Int!
    votingGroupMemberIds: [ID!]!
    wordMin: Int
    wordMax: Int
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

  type Submission {
    id: ID!
    contestId: ID!
    authorId: ID!
    author: User
    title: String
    description: String
    content: String!
    submittedAt: String!
    voteCount: Int!
    totalScore: Int!
    placement: Int
    certificateUrl: String
    certificateGeneratedAt: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateContestInput {
    title: String!
    prompt: String!
    rules: String
    startTime: String!
    endTime: String!
    createdBy: ID!
    votingType: VotingType
    votingDurationHours: Int
    votingGroupMemberIds: [ID!]
    wordMin: Int
    wordMax: Int
  }

  input CreateUserInput {
    firebaseUid: String!
    email: String!
    displayName: String
  }

  input CreateSubmissionInput {
    contestId: ID!
    authorId: ID!
    title: String
    description: String
    content: String!
  }

  type Query {
    healthCheck: String!
    contests: [Contest!]!
    contest(id: ID!): Contest
    submissionsByContest(contestId: ID!): [Submission!]!
    submission(id: ID!): Submission
    users: [User!]!
  }

  type Mutation {
    createContest(input: CreateContestInput!): Contest!
    createUser(input: CreateUserInput!): User!
    createSubmission(input: CreateSubmissionInput!): Submission!
  }
`
