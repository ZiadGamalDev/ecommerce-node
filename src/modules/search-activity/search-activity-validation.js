import Joi from "joi";

export const recordSearchSchema = {
  body: Joi.object({
    searchQuery: Joi.string().trim().min(1).required(),
  }),
};
