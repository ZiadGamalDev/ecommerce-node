import Router from "express";
import * as categoryController from "./category-controller.js";
import { isAuth } from "./../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "./../../Middlewares/async-handler.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

import * as categoryValidation from "./category-validation.js";
const router = Router();

router.post(
  "/",
  isAuth([systemRoles.ADMIN]),
  multerMiddleHost(allowedExtensions.image).single("image"),
  validationMiddleware(categoryValidation.addCategorySchema),
  asyncHandler(categoryController.addCategory)
);
router.put(
  "/:categoryId",
  isAuth([systemRoles.ADMIN]),
  multerMiddleHost(allowedExtensions.image).single("image"),
  validationMiddleware(categoryValidation.updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

router.get("/", asyncHandler(categoryController.getAllCategories));
router.get(
  "/:categoryId",
  validationMiddleware(categoryValidation.getCategorySchema),
  asyncHandler(categoryController.getCategoryById)
);
export default router;
