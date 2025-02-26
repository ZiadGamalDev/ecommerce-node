import Joi from "joi";
import { objectIdValidation } from "../../utils/custome-validation.js";

export const getReviewSchema = Joi.object({
  params: Joi.object({
    productId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Product ID is required",
    }),
  }),
});

export const addReviewSchema = Joi.object({
  body: Joi.object({
    productId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Product ID is required",
    }),
    reviewRate: Joi.number().min(1).max(5).required().messages({
      "number.min": "Review rate must be at least 1",
      "number.max": "Review rate cannot exceed 5",
      "any.required": "Review rate is required",
    }),
    reviewComment: Joi.string().min(3).max(500).required().trim().messages({
      "string.min": "Review comment must be at least 3 characters long",
      "string.max": "Review comment cannot exceed 500 characters",
      "any.required": "Review comment is required",
    }),
  }),
});

export const updateReviewSchema = Joi.object({
  body: Joi.object({
    reviewRate: Joi.number().min(1).max(5).optional().messages({
      "number.min": "Review rate must be at least 1",
      "number.max": "Review rate cannot exceed 5",
    }),
    reviewComment: Joi.string().min(3).max(500).optional().trim().messages({
      "string.min": "Review comment must be at least 3 characters long",
      "string.max": "Review comment cannot exceed 500 characters",
    }),
  }),
  params: Joi.object({
    reviewId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Review ID is required",
    }),
  }),
});

export const deleteReviewSchema = Joi.object({
  params: Joi.object({
    reviewId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Review ID is required",
    }),
  }),
});
