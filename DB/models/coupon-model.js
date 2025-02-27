import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    couponStatus: {
      type: String,
      default: "valid",
      enum: ["valid", "expired"],
    },
    isFixed: {
      type: Boolean,
    },
    isPercentage: {
      type: Boolean,
    },
    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
