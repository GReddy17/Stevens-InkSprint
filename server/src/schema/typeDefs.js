export const typeDefs = `#graphql
  enum ContestStatus {
    UPCOMING
    ACTIVE
    VOTING
    COMPLETED
  }

  enum VotingType {
    EVERYONE
    JUDGES
    CREATOR
  }

  type User {
    id: ID!
    firebaseUid: String!
    email: String!
    displayName: String
    createdAt: String!
    updatedAt: String!
  }

  type Contest {
    id: ID!
    title: String!
    prompt: String!
    rules: String
    startTime: String!
    endTime: String!
    status: ContestStatus!
    createdBy: User!
    votingType: VotingType!
    votingGroupMemberIds: [ID!]!
    votingGroupMembers: [User!]!
    votingStartTime: String
    votingEndTime: String
    wordMin: Int
    wordMax: Int
    createdAt: String!
    updatedAt: String!
    submissions: [Submission!]!
    submissionCount: Int!
  }

  type Submission {
    id: ID!
    contest: Contest!
    author: User!
    content: String!
    contentUrl: String
    title: String
    description: String
    submittedAt: String!
    voteCount: Int!
    styleScore: Int!
    creativityScore: Int!
    storytellingScore: Int!
    averageStyleScore: Float!
    averageCreativityScore: Float!
    averageStorytellingScore: Float!
    averageTotalScore: Float!
    totalScore: Int!
    placement: Int
    certificateUrl: String
    certificateGeneratedAt: String
    createdAt: String!
    updatedAt: String!
    votes: [Vote!]!
  }

  type Vote {
    id: ID!
    contest: Contest!
    submission: Submission!
    voter: User!
    styleScore: Int!
    creativityScore: Int!
    storytellingScore: Int!
    totalScore: Int!
    votedAt: String!
  }

  type FinalizeResult {
    contest: Contest!
    submissions: [Submission!]!
  }

  input CreateContestInput {
    title: String!
    prompt: String!
    rules: String
    startTime: String!
    endTime: String!
    votingType: VotingType
    votingGroupMemberIds: [ID!]
    votingStartTime: String
    votingEndTime: String
    wordMin: Int
    wordMax: Int
  }

  input UpdateContestInput {
    title: String
    prompt: String
    rules: String
    startTime: String
    endTime: String
    votingType: VotingType
    votingGroupMemberIds: [ID!]
    votingStartTime: String
    votingEndTime: String
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
    content: String!
    title: String
    description: String
  }

  input CastVoteInput {
    contestId: ID!
    submissionId: ID!
    styleScore: Int!
    creativityScore: Int!
    storytellingScore: Int!
  }

  type Query {
    healthCheck: String!

    me: User
    users: [User!]!
    user(id: ID!): User

    contests: [Contest!]!
    contest(id: ID!): Contest
    contestsByStatus(status: ContestStatus!): [Contest!]!

    submissions: [Submission!]!
    submission(id: ID!): Submission
    submissionsByContest(contestId: ID!): [Submission!]!
    submissionsByUser(authorId: ID!): [Submission!]!
    votesBySubmission(submissionId: ID!): [Vote!]
    votesByContest(contestId: ID!): [Vote!]
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!

    createContest(input: CreateContestInput!): Contest!
    updateContest(id: ID!, input: UpdateContestInput!): Contest!
    deleteContest(id: ID!): Contest!

    createSubmission(input: CreateSubmissionInput!): Submission!
    deleteSubmission(id: ID!): Submission!

    castVote(input: CastVoteInput!): Vote!

    finalizeContest(id: ID!): FinalizeResult!
  }
`