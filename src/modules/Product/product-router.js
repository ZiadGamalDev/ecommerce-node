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

// get all products
router.get("/", asyncHandler(productController.getAllProducts));

// add product
router.post("/:categoryId/:brandId", isAuth([systemRoles.ADMIN]), multerMiddleHost(allowedExtensions.image).array("files", 5), validationMiddleware(productvalidation.addProductSchema), asyncHandler(productController.addproduct));

// update product
router.put("/:productId", isAuth([systemRoles.ADMIN]), multerMiddleHost(allowedExtensions.image).array("files", 5), validationMiddleware(productvalidation.updateProductSchema), asyncHandler(productController.updateProduct));

// get single-product
router.get("/:productId", asyncHandler(productController.getProductById));

export default router;
