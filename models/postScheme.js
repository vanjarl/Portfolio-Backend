import mongoose from 'mongoose';

const postScheme = mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
      unique: true,
      trim: true,
    },
    text: {
      required: true,
      type: String,
      unique: true,
      trim: true,
    },
    tags: {
      type: Array,
      default: [],
    },

    viewsCount: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('post', postScheme);
