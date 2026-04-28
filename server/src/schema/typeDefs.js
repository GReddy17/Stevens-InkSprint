// server/src/schema/typeDefs.js
export const typeDefs = `#graphql
  # ------------------------------
  # Enums
  # ------------------------------
  enum UserRole {
    ADMIN
    JUDGE
    PARTICIPANT
  }

  enum ContestStatus {
    UPCOMING
    ACTIVE
    CLOSED
    JUDGING
    COMPLETED
  }

  # ------------------------------
  # Types
  # ------------------------------
  type User {
    id: ID!
    firebaseUid: String!
    email: String!
    displayName: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  type Contest {
    id: ID!
    title: String!
    prompt: String!
    rules: String
    startTime: String!          # ISO datetime
    endTime: String!            # ISO datetime
    status: ContestStatus!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
    submissions: [Submission!]! # Optional: resolves submissions of this contest
    winners: [Winner!]!         # Optional: resolves winners of this contest
  }

  type Submission {
    id: ID!
    contest: Contest!
    author: User!
    contentUrl: String!         # Firebase Storage URL
    title: String
    submittedAt: String!
    score: Float
    placement: Int
    feedback: String
    createdAt: String!
    updatedAt: String!
  }

  type Winner {
    id: ID!
    contest: Contest!
    submission: Submission!
    placement: Int!
    certificateUrl: String
    generatedAt: String
    createdAt: String!
    updatedAt: String!
  }

  # ------------------------------
  # Input Types
  # ------------------------------
  input CreateContestInput {
    title: String!
    prompt: String!
    rules: String
    startTime: String!   # ISO datetime
    endTime: String!     # ISO datetime
  }

  input UpdateContestInput {
    title: String
    prompt: String
    rules: String
    startTime: String
    endTime: String
    status: ContestStatus
  }

  input SubmitEntryInput {
    contestId: ID!
    title: String
    contentUrl: String!   # URL from Firebase Storage after upload
  }

  input ScoreSubmissionInput {
    submissionId: ID!
    score: Float!
    feedback: String
  }

  input DeclareWinnerInput {
    submissionId: ID!
    placement: Int!       # 1, 2, 3, etc.
  }

  # ------------------------------
  # Queries
  # ------------------------------
  type Query {
    # Current authenticated user
    me: User

    # Admin/ Judge only: list all users (optional, can be restricted)
    users: [User!]!

    # Contest queries
    contests(status: ContestStatus): [Contest!]!   # filter by status
    contest(id: ID!): Contest

    # Submission queries
    submissions(contestId: ID!): [Submission!]!    # all submissions for a contest (admins/judges see all; participants see only their own)
    mySubmissions: [Submission!]!                  # submissions by current user

    # Winner queries
    winners(contestId: ID!): [Winner!]!            # winners of a specific contest
  }

  # ------------------------------
  # Mutations
  # ------------------------------
  type Mutation {
    # Contest mutations (admin only)
    createContest(input: CreateContestInput!): Contest!
    updateContest(id: ID!, input: UpdateContestInput!): Contest!
    deleteContest(id: ID!): Boolean!
    updateContestStatus(id: ID!, status: ContestStatus!): Contest!   # manually change status

    # Submission mutations
    submitEntry(input: SubmitEntryInput!): Submission!
    updateSubmission(id: ID!, title: String, contentUrl: String): Submission!   # only author can edit before deadline
    deleteSubmission(id: ID!): Boolean!        # author or admin

    # Judging mutations (judge/admin only)
    scoreSubmission(input: ScoreSubmissionInput!): Submission!
    declareWinners(contestId: ID!, winners: [DeclareWinnerInput!]!): [Winner!]!   # replaces previous winners

    # Admin only: update user role
    updateUserRole(userId: ID!, role: UserRole!): User!
  }
`;