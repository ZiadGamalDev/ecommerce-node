import Router from "express";
import * as reviewController from "./review-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as reviewValidation from "./review-validation.js";

const router = Router();

//============================== Get Reviews for a Product ==============================//
router.get(
  "/:productId",
  validationMiddleware(reviewValidation.getReviewSchema),
  asyncHandler(reviewController.getReviews)
);

//============================== Add Review ==============================//
router.post(
  "/",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(reviewValidation.addReviewSchema),
  asyncHandler(reviewController.addReview)
);

//============================== Update Review ==============================//
router.put(
  "/:reviewId",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(reviewValidation.updateReviewSchema),
  asyncHandler(reviewController.updateReview)
);

//============================== Delete Review ==============================//
router.delete(
  "/:reviewId",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(reviewValidation.deleteReviewSchema),
  asyncHandler(reviewController.deleteReview)
);

export default router;
