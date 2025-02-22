// import mongoose from "mongoose ";
// import { Schema, Types } from "mongoose";

// import { ERROR_MESSAGES } from "../shared/error-message.js";

// const subCategorySchema = new Schema(
//   {
//     name: {
//       type: String,
//       unique: [true, ERROR_MESSAGES.unique("Subcategory name")],
//       trim: true,
//       required: [true, ERROR_MESSAGES.required("Subcategory name")],
//       minLength: [3, ERROR_MESSAGES.minLength("Subcategory name", 3)],
//       maxLength: [50, ERROR_MESSAGES.maxLength("Subcategory name", 50)],
//     },
//     slug: {
//       type: String,
//       lowercase: true,
//       required: true,
//       index: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//       maxLength: [500, ERROR_MESSAGES.maxLength("Description", 500)],
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     category: {
//       type: Schema.Types.ObjectId,
//       ref: "Category",
//       required: [true, ERROR_MESSAGES.required("Category reference")],
//       index: true,
//     },
//     metadata: {
//       type: Map,
//       of: String,
//       default: new Map(),
//     },
//     addedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, ERROR_MESSAGES.required("Added by reference")],
//       index: true,
//     },
//     updatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // brands virtual populate
// subCategorySchema.virtual("Brands", {
//   ref: "Brand",
//   localField: "_id",
//   foreignField: "subCategory",
//   // justOne: true
// });

// subCategorySchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
//   }
//   next();
// });

// export default mongoose.models.SubCategory ||
//   model("SubCategory", subCategorySchema);
