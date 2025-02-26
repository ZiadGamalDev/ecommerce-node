import Router from "express";
import * as wishListController from "./WishList-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";
import { wishListSchema } from "./WishList.validation.js";

const router = Router();

router.get(
  "/",
  isAuth([systemRoles.USER]),
  asyncHandler(wishListController.getWishList)
);

router.post(
  "/",
  isAuth([systemRoles.USER]),
  validationMiddleware(wishListSchema),
  asyncHandler(wishListController.addToWishList)
);

router.delete(
  "/",
  isAuth([systemRoles.USER]),
  validationMiddleware(wishListSchema),
  asyncHandler(wishListController.removeFromWishList)
);

export default router;
