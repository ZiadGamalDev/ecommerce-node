import Joi from "joi";

export const updateProfileSchema = {
  body: Joi.object({
    username: Joi.string(),
    email: Joi.string().email(),
    phoneNumbers: Joi.array().items(Joi.string().pattern(/^(01)[0-9]{9}$/)),
    addresses: Joi.array().items(Joi.string().min(10)),
    age: Joi.number().integer().min(0),
  })
}
