import Router from "express";
import * as cartController from "./cart-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import * as cartValidation from "./cart-validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.get(
  "/:userId",
  isAuth([systemRoles.USER]),
  validationMiddleware(cartValidation.getCartSchema),
  asyncHandler(cartController.getCart)
);

router.post(
  "/:userId",
  isAuth([systemRoles.USER]),
  validationMiddleware(cartValidation.addToCartSchema),
  cartController.addToCart
);

export default router;
