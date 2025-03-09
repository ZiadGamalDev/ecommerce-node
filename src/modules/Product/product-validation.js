import Joi from "joi";
import { generalValidationRule } from "../../utils/custome-validation.js";

export const addProductSchema = {
  body: Joi.object({
    title: Joi.string()
      .required()
      .messages({ "any.required": "Product title is required" })
      .min(3)
      .messages({ "string.min": "Title must be at least 3 characters long" })
      .max(100)
      .messages({ "string.max": "Title cannot exceed 100 characters" }),

    basePrice: Joi.number() // Fixed variable name from baseprice to basePrice
      .required()
      .messages({ "any.required": "Base price is required" })
      .positive()
      .messages({ "number.positive": "Base price must be a positive number" }),

    stock: Joi.number()
      .integer()
      .messages({ "number.integer": "Stock must be a whole number" })
      .required()
      .messages({ "any.required": "Stock quantity is required" })
      .min(0)
      .messages({ "number.min": "Stock cannot be negative" }),

    discountType: Joi.string()
      .valid("percentage", "fixed")
      .default("percentage")
      .messages({
        "any.only": 'Discount type must be either "percentage" or "fixed"',
      }),

    discountValue: Joi.number()
      .min(0)
      .messages({ "number.min": "Discount value cannot be negative" })
      .when("discountType", {
        // Added conditional validation
        is: "percentage",
        then: Joi.number().max(100).messages({
          "number.max": "Discount percentage cannot exceed 100%",
        }),
      })
      .default(0),

    // Uncommented the specs validation but made it optional
    specs: Joi.array()
      .optional()
      .items(
        Joi.object().pattern(
          Joi.string(),
          Joi.alternatives().try(
            Joi.string(),
            Joi.number(),
            Joi.boolean(),
            Joi.array().items(Joi.string(), Joi.number(), Joi.boolean())
          )
        )
      )
      .messages({ "array.base": "Specifications must be a valid array" }),

    description: Joi.string()
      .required()
      .messages({ "any.required": "Product description is required" })
      .min(10)
      .messages({
        "string.min": "Description must be at least 10 characters long",
      }),
  }),

  params: Joi.object({
    categoryId: generalValidationRule.dbId
      .required()
      .messages({ "any.required": "Category ID is required" }),

    brandId: generalValidationRule.dbId
      .required()
      .messages({ "any.required": "Brand ID is required" }),
  }),

  files: Joi.array()
    .min(1)
    .messages({ "array.min": "At least one product image is required" })
    .required()
    .messages({ "any.required": "Product images are required" }),
};

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .messages({ "string.min": "Title must be at least 3 characters long" })
      .max(100)
      .messages({ "string.max": "Title cannot exceed 100 characters" }),

    stock: Joi.number()
      .integer()
      .messages({ "number.integer": "Stock must be a whole number" })
      .min(0)
      .messages({ "number.min": "Stock cannot be negative" }),

    basePrice: Joi.number()
      .positive()
      .messages({ "number.positive": "Base price must be a positive number" }),

    discountType: Joi.string().valid("percentage", "fixed").messages({
      "any.only": 'Discount type must be either "percentage" or "fixed"',
    }),

    discountValue: Joi.number()
      .min(0)
      .messages({ "number.min": "Discount value cannot be negative" })
      .when("discountType", {
        // Added conditional validation
        is: "percentage",
        then: Joi.number().max(100).messages({
          "number.max": "Discount percentage cannot exceed 100%",
        }),
      }),

    description: Joi.string().min(10).messages({
      "string.min": "Description must be at least 10 characters long",
    }),

    oldPublicId: Joi.string(),

    specs: Joi.array() // Added specs to updateProductSchema
      .optional()
      .items(
        Joi.object().pattern(
          Joi.string(),
          Joi.alternatives().try(
            Joi.string(),
            Joi.number(),
            Joi.boolean(),
            Joi.array().items(Joi.string(), Joi.number(), Joi.boolean())
          )
        )
      ),

    category: generalValidationRule.dbId.message("Invalid category ID"),
    brand: generalValidationRule.dbId.message("Invalid brand ID"),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),

  params: Joi.object({
    productId: generalValidationRule.dbId
      .required()
      .messages({ "any.required": "Product ID is required" }),
  }),

  file: Joi.object().when("body.oldPublicId", {
    is: Joi.exist(),
    then: Joi.required().messages({
      "any.required": "New image is required when replacing an existing image",
    }),
    otherwise: Joi.optional(),
  }),
};
