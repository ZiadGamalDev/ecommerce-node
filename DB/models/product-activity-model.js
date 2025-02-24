import { Schema, model } from "mongoose";

export const ActionEnum = Object.freeze({
  VIEW: "view",
  ADD_TO_CART: "addToCart",
  REMOVE_FROM_CART: "removeFromCart",
  LIKE: "like",
  DISLIKE: "dislike",
  COMMENT: "comment",
  SHARE: "share",
});

const productTrackingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true }, // Todo: add validation after product implementation
    duration: { type: Number, required: true, min: 0 }, // Time spent on product page in seconds
    price: { type: Number, required: true, min: 0 }, // Product price at the time of action
    action: { type: String, required: true, enum: Object.values(ActionEnum) },
  },
  {
    timestamps: true,
  }
);

const ProductActivity = model("ProductActivity", productTrackingSchema);

export default ProductActivity;