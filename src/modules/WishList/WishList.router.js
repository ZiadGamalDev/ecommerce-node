import Router from "express";
import * as wishListController from "./WishList-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as wishListSchema from "./WishList.validation.js";

const router = Router();

router.get(
  "/",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(wishListController.getWishList)
);

router.post(
  "/",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(wishListSchema.GetWishListSchema),
  asyncHandler(wishListController.addToWishList)
);

router.delete(
  "/:productId",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware({ params: wishListSchema.DeleteWishListSchema }),
  asyncHandler(wishListController.removeFromWishList)
);

export default router;
