import mongoose from 'mongoose'
import Contest from '../models/Contest.js'
import Submission from '../models/Submission.js'
import User from '../models/User.js'
import admin from '../utils/firebaseAdmin.js';
import { validateString, validateEmail, validateContestStatus, validateVotingType, validateDates, validateWordLimits,} from '../utils/validation.js'

export const resolvers = {
  Query: {

    // for testing
    whoami: (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return context.user;
    },

    healthCheck: () => 'Ink Sprint GraphQL server is running',
    
    // Users
    users: async () => {
      return await User.find({});
    },
    user: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid user ID');
      const user = await User.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    },

    // Contests
    contests: async () => {
      return await Contest.find({}).sort({ createdAt: -1 });
    },
    contest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      return contest;
    },
    contestsByStatus: async (_, { status }) => {
      const validStatus = validateContestStatus(status);
      return await Contest.find({ status: validStatus }).sort({ createdAt: -1 });
    },

    // Submissions
    submissions: async () => {
      return await Submission.find({}).sort({ submittedAt: -1 });
    },
    submission: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid submission ID');
      const submission = await Submission.findById(id);
      if (!submission) throw new Error('Submission not found');
      return submission;
    },
    submissionsByContest: async (_, { contestId }) => {
      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID');
      return await Submission.find({ contestId }).sort({ totalScore: -1 });
    },
    submissionsByUser: async (_, { authorId }) => {
      if (!mongoose.Types.ObjectId.isValid(authorId)) throw new Error('Invalid user ID');
      return await Submission.find({ authorId }).sort({ submittedAt: -1 });
    },
  },

  // Relationship resolvers
  Contest: {
    id: (parent) => parent._id.toString(),
    createdBy: async (parent) => {
      return await User.findById(parent.createdBy);
    },
    submissions: async (parent) => {
      return await Submission.find({ contestId: parent._id }).sort({ totalScore: -1 });
    },
    submissionCount: async (parent) => {
      return await Submission.countDocuments({ contestId: parent._id });
    },
  },

  User: {
    id: (parent) => parent._id.toString(),
  },

  Submission: {
    id: (parent) => parent._id.toString(),
    contest: async (parent) => {
      return await Contest.findById(parent.contestId);
    },
    author: async (parent) => {
      return await User.findById(parent.authorId);
    },
  },

  Mutation: {

    // Create user
    createUser: async (_, { input }) => {
      const { firebaseUid, email, displayName } = input;
      validateString(firebaseUid, 'firebaseUid');
      const validEmail = validateEmail(email);

      const existing = await User.findOne({ $or: [{ firebaseUid }, { email: validEmail }] });
      if (existing) throw new Error('User already exists with this firebaseUid or email');

      const user = await new User({
        firebaseUid: firebaseUid.trim(),
        email: validEmail,
        displayName: displayName?.trim() || null,
      }).save();

      return user;
    },

    // Create contest
    createContest: async (_, { input }) => {
      const {
        title, prompt, rules, startTime, endTime, createdBy,
        votingType, votingDurationHours, wordMin, wordMax,
      } = input;

      validateString(title, 'title');
      validateString(prompt, 'prompt');
      const { start, end } = validateDates(startTime, endTime);
      validateWordLimits(wordMin, wordMax);

      if (!mongoose.Types.ObjectId.isValid(createdBy)) throw new Error('Invalid createdBy user ID');
      const creator = await User.findById(createdBy);
      if (!creator) throw new Error('Creator user not found');

      const validVotingType = votingType ? validateVotingType(votingType) : 'EVERYONE';

      const contest = await new Contest({
        title: title.trim(),
        prompt: prompt.trim(),
        rules: rules?.trim() || null,
        startTime: start,
        endTime: end,
        status: 'UPCOMING',
        createdBy,
        votingType: validVotingType,
        votingDurationHours: votingDurationHours || 48,
        wordMin: wordMin || null,
        wordMax: wordMax || null,
      }).save();

      return contest;
    },

    // Update contest fields
    updateContest: async (_, { id, input }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');

      const update = {};
      if (input.title) update.title = validateString(input.title, 'title');
      if (input.prompt) update.prompt = validateString(input.prompt, 'prompt');
      if (input.rules !== undefined) update.rules = input.rules?.trim() || null;
      if (input.startTime || input.endTime) {
        const { start, end } = validateDates(
          input.startTime || contest.startTime,
          input.endTime || contest.endTime
        );
        if (input.startTime) update.startTime = start;
        if (input.endTime) update.endTime = end;
      }
      if (input.votingType) update.votingType = validateVotingType(input.votingType);
      if (input.votingDurationHours) update.votingDurationHours = input.votingDurationHours;
      if (input.wordMin !== undefined || input.wordMax !== undefined) {
        validateWordLimits(
          input.wordMin ?? contest.wordMin,
          input.wordMax ?? contest.wordMax
        );
        if (input.wordMin !== undefined) update.wordMin = input.wordMin;
        if (input.wordMax !== undefined) update.wordMax = input.wordMax;
      }

      const updated = await Contest.findByIdAndUpdate(id, { $set: update }, { new: true });
      return updated;
    },

    // Update contest status
    updateContestStatus: async (_, { id, status }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID');
      const validStatus = validateContestStatus(status);
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      const updated = await Contest.findByIdAndUpdate(
        id,
        { $set: { status: validStatus } },
        { new: true }
      );
      return updated;
    },

    // Delete contest
    deleteContest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');
      await Submission.deleteMany({ contestId: id });
      await Contest.findByIdAndDelete(id);
      return contest;
    },

    // Create submission
    createSubmission: async (_, { input }) => {
      const { contestId, authorId, content, title, description } = input;

      if (!mongoose.Types.ObjectId.isValid(contestId)) throw new Error('Invalid contest ID');
      if (!mongoose.Types.ObjectId.isValid(authorId)) throw new Error('Invalid author ID');
      validateString(content, 'content');

      const contest = await Contest.findById(contestId);
      if (!contest) throw new Error('Contest not found');
      if (contest.status !== 'ACTIVE') throw new Error('Contest is not currently active');

      const author = await User.findById(authorId);
      if (!author) throw new Error('Author user not found');

      const existing = await Submission.findOne({ contestId, authorId });
      if (existing) throw new Error('User has already submitted to this contest');

      const submission = await new Submission({
        contestId,
        authorId,
        content: content.trim(),
        title: title?.trim() || null,
        description: description?.trim() || null,
        submittedAt: new Date(),
        voteCount: 0,
        totalScore: 0,
      }).save();

      return submission;
    },

    // Delete submission
    deleteSubmission: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid submission ID');
      const submission = await Submission.findById(id);
      if (!submission) throw new Error('Submission not found');
      await Submission.findByIdAndDelete(id);
      return submission;
    },

    // Finalize contest - rank submissions and assign placements
    finalizeContest: async (_, { id }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid contest ID');
      const contest = await Contest.findById(id);
      if (!contest) throw new Error('Contest not found');

      if (!['VOTING', 'JUDGING', 'CLOSED'].includes(contest.status)) {
        throw new Error('Contest must be in VOTING, JUDGING, or CLOSED status to finalize');
      }

      const submissions = await Submission.find({ contestId: id }).sort({ totalScore: -1 });

      const updatedSubmissions = await Promise.all(
        submissions.map(async (sub, index) => {
          const placement = index + 1;
          const certificateUrl = `/certs/${contest.title.replace(/\s+/g, '_').toLowerCase()}_${placement}_${sub._id}.pdf`;
          return Submission.findByIdAndUpdate(
            sub._id,
            {
              $set: {
                placement,
                certificateUrl,
                certificateGeneratedAt: new Date(),
              },
            },
            { new: true }
          );
        })
      );

      const finalizedContest = await Contest.findByIdAndUpdate(
        id,
        { $set: { status: 'COMPLETED' } },
        { new: true }
      );

      return { contest: finalizedContest, submissions: updatedSubmissions };
    },
  },
};