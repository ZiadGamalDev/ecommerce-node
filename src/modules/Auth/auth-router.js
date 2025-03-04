import Router from "express";
import * as authController from "./auth-controller.js";
import * as authValidation from "./auth-validation.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";
import { isAuth } from "../../Middlewares/isAuth.js";

const router = Router();

router.post(
  "/",
  validationMiddleware(authValidation.signUp),
  asyncHandler(authController.signUp)
);
router.get(
  "/verify-email",
  validationMiddleware(authValidation.verifyEmail),
  asyncHandler(authController.verifyEmail)
);

router.post(
  "/login",
  validationMiddleware(authController.logIn),
  asyncHandler(authController.logIn)
);

router.put(
  "/forgetpassword",
  validationMiddleware(authValidation.forgetPassword),
  asyncHandler(authController.forgetPassword)
);

router.put(
  "/reset-password",
  validationMiddleware(authValidation.resetPassword),
  asyncHandler(authController.resetPassword)
);

router.post(
  "/logout",
  isAuth([systemRoles.USER]),
  asyncHandler(authController.logout)
);

export default router;
