import mongoose from 'mongoose';

const priceSchema = mongoose.Schema(
  {
    price: {
      type: [Number],
      required: true,
    },
    duration: {
      type: [String],
      required: true,
    },
  },
  { _id: false },
);

const itemScheme = mongoose.Schema(
  {
    imageUrl: {
      required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
      unique: true,
    },
    category: {
      required: true,
      type: String,
    },
    rating: {
      required: true,
      type: String,
    },
    text: {
      required: true,
      type: String,
      unique: true,
    },
    userId: {
      type: String,
    },
    priceList: {
      type: Map,
      of: priceSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('item', itemScheme);
