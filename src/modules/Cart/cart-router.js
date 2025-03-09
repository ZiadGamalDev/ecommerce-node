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
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(cartController.getCart)
);

router.post(
  "/",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(cartValidation.addToCartSchema),
  asyncHandler(cartController.addToCart)
);

router.delete(
  "/:productId",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(cartValidation.removeFromCartSchema),
  asyncHandler(cartController.removeFromCart)
);

export default router;
