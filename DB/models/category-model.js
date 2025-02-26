import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ERROR_MESSAGES } from "../shared/error-message.js";
import { imageSchema } from "../shared/image-schema.js";
import slugify from "slugify";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      unique: [true, ERROR_MESSAGES.unique("Category name")],
      trim: true,
      required: [true, ERROR_MESSAGES.required("Category name")],
      minLength: [3, ERROR_MESSAGES.minLength("Category name", 3)],
      maxLength: [50, ERROR_MESSAGES.maxLength("Category name", 50)],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
      // Remove required: true since we'll generate it
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, ERROR_MESSAGES.maxLength("Description", 500)],
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    folderId: {
      type: String,
      required: [true, ERROR_MESSAGES.required("Folder ID")],
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: () => new Map(),
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// categorySchema.virtual("subcategories", {
//   ref: "SubCategory",
//   localField: "_id",
//   foreignField: "category",
// });

categorySchema.virtual("brands", {
  ref: "Brand",
  localField: "_id",
  foreignField: "category",
});

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, "-");
  }
  next();
});

// categorySchema.post("save", function (error, doc, next) {
//   if (error.name === "MongoServerError" && error.code === 11000) {
//     next(new Error("A category with this name already exists"));
//   } else {
//     next(error);
//   }
// });

const Category = mongoose.model("Category", categorySchema);

export default Category;
