import Joi from "joi";
import { generalValidationRule } from "../../utils/custome-validation.js";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(30).alphanum(),
    couponAmount: Joi.number().required().min(1),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    isForSpecificUsers: Joi.boolean(),
    maxUsage: Joi.number().integer().min(1),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
  }),
};


export const assignCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(30).alphanum(),
    users: Joi.array().items(generalValidationRule.dbId).required(),
    maxUsage: Joi.number().integer().min(1),
  }),
}

export const updateCouponSchema = {
  params: Joi.object({
    couponId: generalValidationRule.dbId.required(),
  }),
  body: Joi.object({
    couponCode: Joi.string().min(3).max(30).alphanum(),
    couponAmount: Joi.number().min(1),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    fromDate: Joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: Joi.date().greater(Joi.ref("fromDate")),
    couponStatus: Joi.string().valid("valid", "expired"),
  }).min(1),
};


export const applyCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().min(3).max(30).alphanum(),
  }),
};


export const updateCouponAssignmentsSchema = {
  params: Joi.object({
    couponCode: Joi.string().required().min(3).max(30).alphanum(),
  }),
  body: Joi.object({
    addUsers: Joi.array().items(generalValidationRule.dbId),
    removeUsers: Joi.array().items(generalValidationRule.dbId),
    updateMaxUsage: Joi.number().integer().min(1),
  }).or("addUsers", "removeUsers", "updateMaxUsage"),
};

export const deleteCouponSchema = {
  params: Joi.object({
    couponId: generalValidationRule.dbId.required(),
  }),
};
