import express from "express";
import { getSettings, saveSettings } from "./settings-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { saveSettingsSchema } from "./settings-validation.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

const router = express.Router();

router.get("/", isAuth([systemRoles.ADMIN]), asyncHandler(getSettings));
router.post("/", isAuth([systemRoles.ADMIN]), validationMiddleware(saveSettingsSchema), asyncHandler(saveSettings));

export default router;
