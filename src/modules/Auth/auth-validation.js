import Joi from "joi";

export const signUp = {
  body: Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required().messages({
      "string.base": "Username must be a text string",
      "string.empty": "Username cannot be empty",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 20 characters",
      "string.alphanum": "Username must only contain letters and numbers",
    }),

    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email address is required",
      }),

    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must be 8-30 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
        "string.empty": "Password is required",
      }),

    repeat_password: Joi.ref("password"),

    phoneNumbers: Joi.array()
      .items(
        Joi.string()
          .pattern(/^01[0125][0-9]{8}$/)
          .messages({
            "string.pattern.base": "Invalid Egyptian phone number format",
          })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one phone number is required",
        "array.base": "Phone numbers must be provided as an array",
      }),

    age: Joi.number().integer().min(18).max(100).required().messages({
      "number.base": "Age must be a number",
      "number.min": "You must be at least 18 years old",
      "number.max": "Age cannot exceed 100 years",
      "number.integer": "Age must be a whole number",
    }),

    role: Joi.string()
      .valid("user", "admin")
      .messages({ "any.only": "Role must be either 'user' or 'admin'" }),

    addresses: Joi.array()
      .items(
        Joi.string().min(10).max(200).messages({
          "string.min": "Address must be at least 10 characters long",
          "string.max": "Address cannot exceed 200 characters",
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one address is required",
        "array.base": "Addresses must be provided as an array",
      }),
  }).required(),
};

export const logIn = {
  body: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
      }),

    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
      .required()
      .messages({
        "string.empty": "Password is required",
      }),
  }),
};

export const verifyEmail = {
  query: Joi.object({
    token: Joi.string()
      .pattern(/^[\w-]+\.[\w-]+\.[\w-]+$/)
      .required()
      .messages({
        "string.empty": "Token is required",
        "string.pattern.base": "Invalid token format",
        "any.required": "Token is missing",
      }),
  }),
};

export const forgetPassword = {
  body: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
      }),
  }),
};

export const resetPassword = {
  query: Joi.object({
    token: Joi.string()
      .pattern(/^[\w-]+\.[\w-]+\.[\w-]+$/)
      .required()
      .messages({
        "string.empty": "Token is required",
        "string.pattern.base": "Invalid token format",
        "any.required": "Token is missing",
      }),
  }),
  body: Joi.object({
    newPassword: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
      .required()
      .messages({
        "string.empty": "Password is required",
      }),
  }),
};
