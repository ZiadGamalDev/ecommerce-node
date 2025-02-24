import { Schema, model } from "mongoose";

const searchTrackingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    searchQuery: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const SearchActivity = model("SearchActivity", searchTrackingSchema);

export default SearchActivity;