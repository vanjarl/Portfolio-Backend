import mongoose from 'mongoose';

const commentScheme = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      required: true,
    },
    // each comment can only relates to one blog, so it's not in array
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('comment', commentScheme);
