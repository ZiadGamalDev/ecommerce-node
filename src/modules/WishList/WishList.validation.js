import Joi from "joi";
import { objectIdValidation } from "../../utils/custome-validation.js";

const DeleteWishListSchema = Joi.object({
  params: Joi.object({
    productId: Joi.custom(objectIdValidation)
      .required()
      .messages({ "any.required": "Product ID is required" }),
  }),
}).unknown(true);

const GetWishListSchema = Joi.object({
  body: Joi.object({
    productId: Joi.custom(objectIdValidation)
      .required()
      .messages({ "any.required": "Product ID is required" }),
  }),
}).unknown(true);

export { GetWishListSchema, DeleteWishListSchema };
