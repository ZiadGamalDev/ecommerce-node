import { ERROR_MESSAGES } from "./error-message.js";

export const imageSchema = {
  secure_url: {
    type: String,
    required: [true, ERROR_MESSAGES.required("Image URL")],
    validate: {
      validator: (v) => /^https:\/\/.+/.test(v),
      message: ERROR_MESSAGES.invalid("secure URl"),
    },
  },

  public_id: {
    type: String,
    required: [true, ERROR_MESSAGES.required("Public ID")],
    unique: true,
  },
  metadata: {
    size: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number,
    },
  },
};
