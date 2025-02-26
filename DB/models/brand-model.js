import { Schema , model } from "mongoose";
import mongoose from "mongoose";
import slugify from "slugify";

import { ERROR_MESSAGES } from "../shared/error-message.js";
import { imageSchema } from "../shared/image-schema.js";
const brandSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      unique: [true, ERROR_MESSAGES.unique("Brand name")],
      trim: true,
      required: [true, ERROR_MESSAGES.required("Brand name")],
      minLength: [3, ERROR_MESSAGES.minLength("Brand name", 3)],
      maxLength: [50, ERROR_MESSAGES.maxLength("Brand name", 50)],
    },
    slug: {
      type: String,
      lowercase: true,

      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, ERROR_MESSAGES.maxLength("Description", 500)],
    },
    logo: imageSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
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

    // subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

brandSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, "-");
  }
  next();
});


export default mongoose.models.Brand || model("Brand", brandSchema);
