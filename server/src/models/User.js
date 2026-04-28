import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true, 
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'JUDGE', 'PARTICIPANT'],
      default: 'PARTICIPANT',
      index: true, 
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;