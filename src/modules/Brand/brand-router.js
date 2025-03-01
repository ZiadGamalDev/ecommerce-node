import Router from "express"
import * as brandController from "./brand-controller.js"
import { isAuth } from "./../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "./../../Middlewares/async-handler.js";
import { multerMiddleHost } from "../../Middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extentions.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

import * as brandValidation from "./brand-validation.js";

const router = Router()
router.post(
    "/:categoryId",
    isAuth([systemRoles.ADMIN]),
    multerMiddleHost(allowedExtensions.image).single("image"),
    validationMiddleware(brandValidation.addBrandSchema),
    asyncHandler(brandController.addBrand)
)

router.put(
    "/:brandId",
    isAuth([systemRoles.ADMIN]),
    multerMiddleHost(allowedExtensions.image).single("image"),
    validationMiddleware(brandValidation.updateBrandSchema),
    asyncHandler(brandController.updateBrand)
)

router.get("/",
    asyncHandler(brandController.getBrands)
)

router.get(
    "/:brandId",
    validationMiddleware(brandValidation.getBrandSchema),
    asyncHandler(brandController.getBrandById))

    export default router