import slugify from "slugify";
import mongoose, { model, Schema } from "mongoose";
import { ERROR_MESSAGES } from "../shared/error-message.js";
import { imageSchema } from "../shared/image-schema.js";

const productSchema = new Schema(
  {
    title: {
      type: String,
      // unique: [true, ERROR_MESSAGES.unique("Product title")],
      trim: true,
      required: [true, ERROR_MESSAGES.required("Product title")],
      minLength: [3, ERROR_MESSAGES.minLength("Product title", 3)],
      maxLength: [100, ERROR_MESSAGES.maxLength("Product title", 100)],
    },
    description: {
      type: String,
      trim: true,
      required: [true, ERROR_MESSAGES.required("Product description")],
      minLength: [3, ERROR_MESSAGES.minLength("Product description", 3)],
      maxLength: [500, ERROR_MESSAGES.maxLength("Product description", 500)],
    },
    slug: {
      type: String,

      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
      index: true,
    },
    folderId: {
      type: String,
      required: [true, ERROR_MESSAGES.required("Folder ID")],
      unique: true,
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, ERROR_MESSAGES.required("Base price")],
      min: [0, ERROR_MESSAGES.negative("Base price")],
    },
    discount: {
      type: {
        type: String,
        enum: ["fixed", "percentage"],
        required: [true, ERROR_MESSAGES.required("Discount type")],
        default: "percentage",
      },
      value: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value) {
            if (this.discount.type === "percentage") {
              return value >= 0 && value <= 100;
            }
            return value >= 0 && value <= this.basePrice;
          },
          message: function (props) {
            if (this.discount.type === "percentage") {
              return ERROR_MESSAGES.range("Percentage discount", 0, 100);
            }
            return "Fixed discount cannot be negative or greater than base price";
          },
        },
      },
    },
    appliedPrice: {
      type: Number,
      required: [true, ERROR_MESSAGES.required("Applied price")],
      min: [0, ERROR_MESSAGES.negative("Applied price")],
      validate: {
        validator: function (value) {
          return value <= this.basePrice;
        },
        message: "Applied price cannot be greater than base price",
      },
    },
    stock: {
      type: Number,
      required: [true, ERROR_MESSAGES.required("Stock quantity")],
      min: [0, ERROR_MESSAGES.negative("Stock")],
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
      min: [0, ERROR_MESSAGES.negative("Rating")],
      max: [5, ERROR_MESSAGES.range("Rating", 0, 5)],
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: ERROR_MESSAGES.required("At least one product image"),
      },
    },
    specs: {
      type: Map,
      of: [String, Number],
      default: new Map(),
      validate: {
        validator: function (v) {
          return v.size <= 50;
        },
        message: "Cannot exceed 50 specifications",
      },
    },
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },
    version: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, ERROR_MESSAGES.required("Added by reference")],
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, ERROR_MESSAGES.required("Category reference")],
      index: true,
    },
    // subCategory: {
    //   type: Schema.Types.ObjectId,
    //   ref: "SubCategory",
    //   required: [true, ERROR_MESSAGES.required("Subcategory reference")],
    //   index: true,
    // },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, ERROR_MESSAGES.required("Brand reference")],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ status: 1, isDeleted: 1 });

// Virtual fields
productSchema.virtual("finalPrice").get(function () {
  if (!this.discount.value) return this.appliedPrice;

  if (this.discount.type === "percentage") {
    return this.appliedPrice * (1 - this.discount.value / 100);
  }
  return Math.max(0, this.appliedPrice - this.discount.value);
});

// Middleware
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, "-");
  }
  if (this.isModified()) {
    this.version += 1;
  }
  next();
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);
