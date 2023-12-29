import mongoose from 'mongoose';

const userScheme = mongoose.Schema(
  {
    fullName: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    passwordHash: {
      required: true,
      type: String,
    },
    avatarUrl: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('user', userScheme);
