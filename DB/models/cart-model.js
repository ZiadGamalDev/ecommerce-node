import mongoose from "mongoose";
import { ERROR_MESSAGES } from "../shared/error-message.js";

const cartSchema = new mongoose.Schema(
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
          quantity: {
            type: Number,
            required: [true, ERROR_MESSAGES.required("Quantity")],
            default: 1,
            min: [1, ERROR_MESSAGES.range("Quantity", 1, "maximum stock")],
            validate: {
              validator: Number.isInteger,
              message: ERROR_MESSAGES.invalid("Quantity"),
            },
          },
          basePrice: {
            type: Number,
            required: [true, ERROR_MESSAGES.required("Base price")],
            min: [0, ERROR_MESSAGES.negative("Base price")],
          },
          finalPrice: {
            type: Number,
            required: [true, ERROR_MESSAGES.required("Final price")],
            min: [0, ERROR_MESSAGES.negative("Final price")],
            validate: {
              validator: function (value) {
                return value <= this.basePrice * this.quantity;
              },
              message:
                "Final price cannot exceed base price multiplied by quantity",
            },
          },
          title: {
            type: String,
            required: [true, ERROR_MESSAGES.required("Product title")],
            trim: true,
            minLength: [3, ERROR_MESSAGES.minLength("Product title", 3)],
            maxLength: [100, ERROR_MESSAGES.maxLength("Product title", 100)],
          },
        },
      ],
      validate: {
        validator: function (products) {
          const productIds = products.map((p) => p.productId.toString());
          return new Set(productIds).size === productIds.length;
        },
        message: "Duplicate products are not allowed in cart",
      },
    },
    subTotal: {
      type: Number,
      required: [true, ERROR_MESSAGES.required("Subtotal")],
      default: 0,
      min: [0, ERROR_MESSAGES.negative("Subtotal")],
      validate: {
        validator: function (value) {
          const calculatedTotal = this.products.reduce(
            (sum, item) => sum + item.finalPrice,
            0
          );
          return Math.abs(value - calculatedTotal) < 0.01;
        },
        message: "Subtotal must match sum of product final prices",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to validate stock availability
cartSchema.pre("save", async function (next) {
  try {
    for (const item of this.products) {
      const product = await mongoose.model("Product").findById(item.productId);
      if (!product) {
        throw new Error(ERROR_MESSAGES.invalid("Product reference"));
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product: ${item.title}. Available: ${product.stock}`
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

cartSchema.index({ userId: 1, "products.productId": 1 });

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
