import Joi from "joi";
import { Types } from "mongoose";

export const objectIdValidation = (value, helper) => {
  const valid = Types.ObjectId.isValid(value);

  return valid ? value : helper.message("Invlaid ObjectId");
};

export const generalValidationRule = {
  headersRule: Joi.object({
    accesstoken: Joi.string().required(),
    "user-agent": Joi.string().required(),
    "postman-token": Joi.string(),
    "content-type": Joi.string(),
    "accept-encoding": Joi.string(),
    "cache-control": Joi.string(),
    accept: Joi.string(),
    host: Joi.string(),
    "accept-language": Joi.string(),
    cookie: Joi.string(),
    connection: Joi.string(),
    "content-length": Joi.string(),
  }),
  dbId: Joi.string().custom(objectIdValidation),
};
