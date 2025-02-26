import Joi from "joi";
import { objectIdValidation } from "../../utils/custome-validation.js";

// Add Brand Schema
export const addBrandSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(50).required().trim().messages({
      "string.empty": "Brand name cannot be empty",
      "string.min": "Brand name must be at least 3 characters long",
      "string.max": "Brand name cannot exceed 50 characters",
      "any.required": "Brand name is required",
    }),
    description: Joi.string().max(500).optional().trim().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    
    
    
  }).required(),
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
params:Joi.object({
    categoryId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Category ID is required",
    }),
  })
};

// Update Brand Schema
export const updateBrandSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(50).optional().trim().messages({
      "string.min": "Brand name must be at least 3 characters long",
      "string.max": "Brand name cannot exceed 50 characters",
    }),
    description: Joi.string().max(500).optional().trim().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    isActive: Joi.boolean().optional(),
    metadata: Joi.object().optional(), // Optional metadata (key-value pairs)
    updatedBy: Joi.custom(objectIdValidation).optional().messages({
      "any.required": "Updated by reference is required",
    }),
    category: Joi.custom(objectIdValidation).optional().messages({
      "any.required": "Category reference is required",
    }),
  }).optional(),
  params: Joi.object({
    brandId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Brand ID is required",
    }),
  }).required(),
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
};

// Get Brand Schema
export const getBrandSchema = {
  params: Joi.object({
    brandId: Joi.custom(objectIdValidation).required().messages({
      "any.required": "Brand ID is required",
    }),
  }).required(),
};