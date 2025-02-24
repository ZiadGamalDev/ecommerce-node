import Joi from "joi";
import { ActionEnum } from "../../../DB/models/product-activity-model.js";

export const recordActivitySchema = {
  body: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    duration: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    action: Joi.string().valid(...Object.values(ActionEnum)).required(),
  })
}
