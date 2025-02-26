// src/utils/general-validation-rule.js
import Joi from "joi";

export const generalValidationRule = {
  dbId: Joi.string()
    .hex()
    .length(24)
    .messages({ 
      "string.hex": "Invalid ID format", 
      "string.length": "ID must be 24 characters long" 
    }),
  // Add other validation rules here
};