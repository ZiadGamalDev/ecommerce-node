import mongoose from "mongoose";

const ordrerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phoneNumbers: [{ type: String, required: true }],

    shippingPrice: { type: Number, required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    totalPrice: { type: Number, required: true }, //shippingPrice - coupon
    paymentMethod: {
      type: String,
      required: true,
      lowercase: true,
      default: "Cash",
      enum: ["cash", "stripe", "paymob"],
    },

    orderStatus: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Paid", "Placed", "Delivered", "Cancelled", "Refunded"],
    },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: String, default: "" },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: String, default: "" },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    payment_intent: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", ordrerSchema);
