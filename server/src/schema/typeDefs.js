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
    votingDurationHours: Int!
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
    points: Int!
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
    createdBy: ID!
    votingType: VotingType
    votingGroupMemberIds: [ID!]
    votingDurationHours: Int
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
    votingDurationHours: Int
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
    content: String!
    title: String
    description: String
  }

  input CastVoteInput {
    contestId: ID!
    submissionId: ID!
    voterId: ID!
    points: Int!
  }

  type Query {
    healthCheck: String!

    users: [User!]!
    user(id: ID!): User

    contests: [Contest!]!
    contest(id: ID!): Contest
    contestsByStatus(status: ContestStatus!): [Contest!]!

    submissions: [Submission!]!
    submission(id: ID!): Submission
    submissionsByContest(contestId: ID!): [Submission!]!
    submissionsByUser(authorId: ID!): [Submission!]!

    votesBySubmission(submissionId: ID!): [Vote!]!
    votesByContest(contestId: ID!): [Vote!]!
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