import Router from "express";
import { isAuth } from "./../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import * as productvalidation from "./product-validation.js";
import * as productController from "./product-controller.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

const router = Router();

router.post(
  "/:categoryId/:brandId",
  isAuth([systemRoles.ADMIN]),
  multerMiddleHost(allowedExtensions.image).array("files", 5),
  validationMiddleware(productvalidation.addProductSchema),
  asyncHandler(productController.addproduct)
);

router.put(
  "/:productId",
  isAuth([systemRoles.ADMIN]),
  multerMiddleHost(allowedExtensions.image).array("files", 5),
  validationMiddleware(productvalidation.updateProductSchema),
  asyncHandler(productController.updateProduct)
);

router.get(
  "/:productId",
  isAuth([systemRoles.ADMIN, systemRoles.USER]),

  asyncHandler(productController.getProductById)
);

router.get("/", asyncHandler(productController.getAllProducts));
export default router;
