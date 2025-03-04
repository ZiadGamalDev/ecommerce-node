import express from "express";
import { isAuth } from "../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { getProfile, updateProfile } from "./profile-controller.js";
import { validationMiddleware } from "../../Middlewares/validation.js";
import { updateProfileSchema } from "./profile-validation.js";

const router = express.Router();

router.get("/", isAuth([systemRoles.USER]), asyncHandler(getProfile));
router.patch("/", isAuth([systemRoles.USER]), validationMiddleware(updateProfileSchema), asyncHandler(updateProfile));

export default router;
