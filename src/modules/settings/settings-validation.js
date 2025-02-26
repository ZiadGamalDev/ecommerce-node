import Joi from "joi";

export const saveSettingsSchema = {
  body: Joi.object({
    settings: Joi.array()
      .items(
        Joi.object({
          key: Joi.string().required(),
          value: Joi.any().required(),
        })
      )
      .min(1)
      .required(),
  }),
};
