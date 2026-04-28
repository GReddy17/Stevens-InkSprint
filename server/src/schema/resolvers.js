import User from '../models/User.js';
import Contest from '../models/Contest.js';
import Submission from '../models/Submission.js';
import Winner from '../models/Winner.js';
import { requireRole } from '../middlewares/roleCheck.js';

// Helper: check if contest is active (based on current time), not sure if we need to have a helper file
function updateContestStatusIfNeeded(contest) {
  const now = new Date();
  let updated = false;
  if (contest.status === 'UPCOMING' && now >= contest.startTime) {
    contest.status = 'ACTIVE';
    updated = true;
  }
  if (contest.status === 'ACTIVE' && now > contest.endTime) {
    contest.status = 'CLOSED';
    updated = true;
  }
  if (updated) {
    return contest.save();
  }
  return contest;
}

export const resolvers = {
  Query: {
    me: (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return User.findById(context.user.id);
    },
    // List all users (admin only)
    users: async (_, __, context) => {
      requireRole(context.user, 'ADMIN');
      return User.find();
    },
    // Contests with optional status filter
    contests: async (_, { status }) => {
      const filter = status ? { status } : {};
      const contests = await Contest.find(filter).sort({ startTime: 1 });
      // Auto-update status for each contest
      for (let i = 0; i < contests.length; i++) {
        await updateContestStatusIfNeeded(contests[i]);
      }
      return contests;
    },
    // Single contest
    contest: async (_, { id }) => {
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      await updateContestStatusIfNeeded(contest);
      return contest;
    },
    // Submissions for a contest – permission based
    submissions: async (_, { contestId }, context) => {
      const contest = await Contest.findById(contestId);
      if (!contest) throw new Error('Contest not found');
      const isAdminOrJudge = context.user && (context.user.role === 'ADMIN' || context.user.role === 'JUDGE');
      if (isAdminOrJudge) {
        // Admins/judges see all submissions
        return Submission.find({ contestId }).populate('authorId');
      } else if (context.user) {
        // Participants see only their own
        return Submission.find({ contestId, authorId: context.user.id }).populate('authorId');
      } else {
        throw new Error('Authentication required');
      }
    },
    mySubmissions: async (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return Submission.find({ authorId: context.user.id }).populate('contestId');
    },
    winners: async (_, { contestId }) => {
      return Winner.find({ contestId }).populate('submissionId');
    },
  },

  Mutation: {
    // Contest Mutations (Admin only)
    createContest: async (_, { input }, context) => {
      requireRole(context.user, 'ADMIN');
      const contest = new Contest({
        ...input,
        createdBy: context.user.id,
        status: 'UPCOMING',
      });
      await contest.save();
      return contest;
    },
    updateContest: async (_, { id, input }, context) => {
      requireRole(context.user, 'ADMIN');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      Object.assign(contest, input);
      await contest.save();
      return contest;
    },
    deleteContest: async (_, { id }, context) => {
      requireRole(context.user, 'ADMIN');
      const result = await Contest.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    updateContestStatus: async (_, { id, status }, context) => {
      requireRole(context.user, 'ADMIN');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      contest.status = status;
      await contest.save();
      return contest;
    },

    // Submission Mutations
    submitEntry: async (_, { input }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const { contestId, title, contentUrl } = input;
      const contest = await Contest.findById(contestId);
      if (!contest) throw new Error('Contest not found');
      // Update status if needed
      await updateContestStatusIfNeeded(contest);
      // Check if contest is active for submission
      const now = new Date();
      if (contest.status !== 'ACTIVE' || now < contest.startTime || now > contest.endTime) {
        throw new Error('Submissions are not open for this contest');
      }
      // Check if user already submitted
      const existing = await Submission.findOne({ contestId, authorId: context.user.id });
      if (existing) throw new Error('You have already submitted to this contest');
      const submission = new Submission({
        contestId,
        authorId: context.user.id,
        title,
        contentUrl,
        submittedAt: now,
      });
      await submission.save();
      return submission;
    },
    updateSubmission: async (_, { id, title, contentUrl }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const submission = await Submission.findById(id);
      if (!submission) throw new Error('Submission not found');
      // Only author can edit, and only before contest deadline
      if (submission.authorId.toString() !== context.user.id && context.user.role !== 'ADMIN') {
        throw new Error('Not authorized to edit this submission');
      }
      const contest = await Contest.findById(submission.contestId);
      const now = new Date();
      if (now > contest.endTime) {
        throw new Error('Cannot edit after contest deadline');
      }
      if (title !== undefined) submission.title = title;
      if (contentUrl !== undefined) submission.contentUrl = contentUrl;
      await submission.save();
      return submission;
    },
    deleteSubmission: async (_, { id }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const submission = await Submission.findById(id);
      if (!submission) throw new Error('Submission not found');
      // Author or admin can delete
      if (submission.authorId.toString() !== context.user.id && context.user.role !== 'ADMIN') {
        throw new Error('Not authorized to delete this submission');
      }
      const result = await Submission.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },

    // Judging Mutations (Judge/Admin only)
    scoreSubmission: async (_, { input }, context) => {
      requireRole(context.user, ['ADMIN', 'JUDGE']);
      const { submissionId, score, feedback } = input;
      const submission = await Submission.findById(submissionId);
      if (!submission) throw new Error('Submission not found');
      submission.score = score;
      if (feedback !== undefined) submission.feedback = feedback;
      await submission.save();
      return submission;
    },
    declareWinners: async (_, { contestId, winners }, context) => {
      requireRole(context.user, ['ADMIN', 'JUDGE']);
      // Verify contest exists and is in JUDGING or COMPLETED state
      const contest = await Contest.findById(contestId);
      if (!contest) throw new Error('Contest not found');
      if (contest.status !== 'JUDGING' && contest.status !== 'COMPLETED') {
        throw new Error('Winners can only be declared for contests in JUDGING or COMPLETED state');
      }
      // Remove previous winners for this contest
      await Winner.deleteMany({ contestId });
      // Create new winner records
      const winnerDocs = [];
      for (const w of winners) {
        const submission = await Submission.findById(w.submissionId);
        if (!submission) throw new Error(`Submission ${w.submissionId} not found`);
        if (submission.contestId.toString() !== contestId) {
          throw new Error(`Submission ${w.submissionId} does not belong to contest ${contestId}`);
        }
        // Update submission placement
        submission.placement = w.placement;
        await submission.save();
        winnerDocs.push({
          contestId,
          submissionId: w.submissionId,
          placement: w.placement,
        });
      }
      const createdWinners = await Winner.insertMany(winnerDocs);

      return createdWinners;
    },

    // Admin only: update user role
    updateUserRole: async (_, { userId, role }, context) => {
      requireRole(context.user, 'ADMIN');
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.role = role;
      await user.save();
      return user;
    },
  },

  // Field resolvers for relationships
  Contest: {
    createdBy: async (parent) => {
      return User.findById(parent.createdBy);
    },
    submissions: async (parent) => {
      return Submission.find({ contestId: parent.id });
    },
    winners: async (parent) => {
      return Winner.find({ contestId: parent.id });
    },
  },
  Submission: {
    contest: async (parent) => {
      return Contest.findById(parent.contestId);
    },
    author: async (parent) => {
      return User.findById(parent.authorId);
    },
  },
  Winner: {
    contest: async (parent) => {
      return Contest.findById(parent.contestId);
    },
    submission: async (parent) => {
      return Submission.findById(parent.submissionId);
    },
  },
};

// /*
//   Testing
// */
// export const resolvers = {
//   Query: {
//     contests: async () => await Contest.find(),
//     contest: async (_, { id }) => await Contest.findById(id),
//     submissions: async (_, { contestId }) => await Submission.find({ contestId }),
//     winners: async () => [],
//   },
//   Mutation: {
//     createContest: async (_, { input }, context) => {
//       const contest = new Contest({
//         ...input,
//         createdBy: context.user?.id || '000000000000000000000001',
//       });
//       await contest.save();
//       return contest;
//     },
//     submitEntry: async (_, { input }, context) => {
//       const submission = new Submission({
//         ...input,
//         authorId: context.user?.id || '000000000000000000000001',
//         submittedAt: new Date(),
//       });
//       await submission.save();
//       return submission;
//     },
//     declareWinners: async () => [], 
//   },
// };