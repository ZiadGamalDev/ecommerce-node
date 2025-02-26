import Router from "express";
import * as cartController from "./cart-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import * as cartValidation from "./cart-validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.get(
  "/",
  isAuth([systemRoles.USER]),
  asyncHandler(cartController.getCart)
);

router.post(
  "/",
  isAuth([systemRoles.USER]),
  validationMiddleware(cartValidation.addToCartSchema),
  asyncHandler(cartController.addToCart)
);

router.delete(
  "/",
  isAuth([systemRoles.USER]),
  validationMiddleware(cartValidation.removeFromCartSchema),
  asyncHandler(cartController.removeFromCart)
);

export default router;
