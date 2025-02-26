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
          title: {
            type: String,
            required: [true, ERROR_MESSAGES.required("Product title")],
            trim: true,
            minLength: [3, ERROR_MESSAGES.minLength("Product title", 3)],
            maxLength: [100, ERROR_MESSAGES.maxLength("Product title", 100)],
          },
          description: {
            type: String,
            trim: true,
            required: [true, ERROR_MESSAGES.required("Product description")],
            minLength: [3, ERROR_MESSAGES.minLength("Product description", 3)],
            maxLength: [
              500,
              ERROR_MESSAGES.maxLength("Product description", 500),
            ],
          },
          stock: {
            type: Number,
            required: [true, ERROR_MESSAGES.required("Stock quantity")],
            min: [0, ERROR_MESSAGES.negative("Stock")],
            default: 0,
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

// Middleware to validate product existence and stock availability
wishListSchema.pre("save", async function (next) {
  try {
    for (const item of this.products) {
      const product = await mongoose.model("Product").findById(item.productId);
      if (!product) {
        throw new Error(ERROR_MESSAGES.invalid("Product reference"));
      }
      if (product.stock <= 0) {
        throw new Error(
          `Product: ${item.title} is out of stock and cannot be added to wishlist.`
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

wishListSchema.index({ userId: 1, "products.productId": 1 });

// Export the model
export default mongoose.models.WishList ||
  mongoose.model("WishList", wishListSchema);
