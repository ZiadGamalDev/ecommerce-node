import Joi from "joi";
import { objectIdValidation } from "../../utils/custome-validation.js";

const wishListSchema = Joi.object({
  productId: Joi.custom(objectIdValidation).required().messages({
    "any.required": "Product ID is required",
  }),
});

export { wishListSchema };
