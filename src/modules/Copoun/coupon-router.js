import Router from "express";
import * as couponController from "./coupon-controller.js";
import * as couponValidation from "./coupon-validation.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";

const router = Router();

// Create coupon - Admin only
router.post(
  "/",
  isAuth([systemRoles.ADMIN]),
  validationMiddleware(couponValidation.addCouponSchema),
  asyncHandler(couponController.createCoupon)
);

// Update coupon - Admin only
router.put(
  "/:couponId",
  isAuth([systemRoles.ADMIN]),
  validationMiddleware(couponValidation.updateCouponSchema),
  asyncHandler(couponController.updateCoupon)
);

// Delete coupon - Admin only
router.delete(
  "/:couponId",
  isAuth([systemRoles.ADMIN]),
  validationMiddleware(couponValidation.deleteCouponSchema),
  asyncHandler(couponController.deleteCoupon)
);

// Assign coupon to users - Admin only
router.post(
  "/assign",
  isAuth([systemRoles.ADMIN]),
  validationMiddleware(couponValidation.assignCouponSchema),
  asyncHandler(couponController.assignCopounTouser)
);

// Update coupon assignments - Admin only
router.patch(
  "/assignments/:couponCode",
  isAuth([systemRoles.ADMIN]),
  validationMiddleware(couponValidation.updateCouponAssignmentsSchema),
  asyncHandler(couponController.updateCouponAssignments)
);

// Apply coupon - User
router.post(
  "/apply",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(couponValidation.applyCouponSchema),
  asyncHandler(couponController.applyCoupon)
);

export default router;
