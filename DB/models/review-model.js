import mongoose from "mongoose";
import { ERROR_MESSAGES } from "../shared/error-message.js";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, ERROR_MESSAGES.required("User ID")],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, ERROR_MESSAGES.required("Product ID")],
      index: true,
    },
    reviewRate: {
      type: Number,
      required: [true, ERROR_MESSAGES.required("Review rate")],
      min: [1, ERROR_MESSAGES.minValue("Review rate", 1)],
      max: [5, ERROR_MESSAGES.maxValue("Review rate", 5)],
    },
    reviewComment: {
      type: String,
      trim: true,
      required: [true, ERROR_MESSAGES.required("Review comment")],
      minLength: [3, ERROR_MESSAGES.minLength("Review comment", 3)],
      maxLength: [500, ERROR_MESSAGES.maxLength("Review comment", 500)],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre("save", async function (next) {
  try {
    const product = await mongoose.model("Product").findById(this.productId);
    if (!product) {
      throw new Error(ERROR_MESSAGES.invalid("Product reference"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
