import mongoose from "mongoose";
import { ERROR_MESSAGES } from "../shared/error-message.js";

const wishListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, ERROR_MESSAGES.required("User ID")],
      index: true,
    },
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, ERROR_MESSAGES.required("Product ID")],
          },
        },
      ],
      validate: {
        validator: function (products) {
          const productIds = products.map((p) => p.productId.toString());
          return new Set(productIds).size === productIds.length;
        },
        message: "Duplicate products are not allowed in wishlist",
      },
    },
  },
  {
    timestamps: true,
  }
);

wishListSchema.pre("save", async function (next) {
  try {
    for (const item of this.products) {
      const product = await mongoose.model("Product").findById(item.productId);
      if (!product) {
        throw new Error(ERROR_MESSAGES.invalid("Product reference"));
      }
      if (product.stock < 1) {
        throw new Error(
          `Product is out of stock and cannot be added to wishlist.`
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

wishListSchema.index(
  { userId: 1, "products.productId": 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.WishList ||
  mongoose.model("WishList", wishListSchema);
