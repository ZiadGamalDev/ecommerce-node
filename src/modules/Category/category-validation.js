import Joi from "joi";

import { objectIdValidation } from "../../utils/custome-validation.js";

export const addCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(50).required().trim().messages({
      "string.empty": "Category name cannot be empty",
      "string.min": "Category name must be at least 3 characters long",
      "string.max": "Category name cannot exceed 50 characters",
      "any.required": "Category name is required",
    }),
    description: Joi.string().max(500).optional().trim().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
  }),
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid("image/jpeg", "image/png", "image/gif", "image/webp")
      .required()
      .messages({
        "any.only": "File must be a valid image (jpeg, png, gif, or webp)",
      }),
    size: Joi.number()
      .max(5242880)
      .required() // 5MB in bytes
      .messages({
        "number.max": "File size cannot exceed 5MB",
      }),
    destination: Joi.string().optional(),
    filename: Joi.string().optional(),
    path: Joi.string().required(),
  })
    .required()
    .messages({
      "any.required": "Image file is required",
    }),
});

export const updateCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(50).optional().trim().messages({
      "string.min": "Category name must be at least 3 characters long",
      "string.max": "Category name cannot exceed 50 characters",
    }),
    description: Joi.string().max(500).optional().trim().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object({
    categoryId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Category ID is required",
    }),
  }),
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid("image/jpeg", "image/png", "image/gif", "image/webp")
      .required(),
    size: Joi.number().max(5242880).required(), // 5MB
    destination: Joi.string().optional(),
    filename: Joi.string().optional(),
    path: Joi.string().required(),
  }).optional(),
});

export const deleteCategorySchema = Joi.object({
  params: Joi.object({
    categoryId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Category ID is required",
    }),
  }),
});

export const getCategorySchema = Joi.object({
  params: Joi.object({
    categoryId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Category ID is required",
    }),
  }),
});
