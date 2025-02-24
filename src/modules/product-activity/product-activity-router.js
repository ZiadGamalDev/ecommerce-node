import express from "express";
import { recordActivity, getActivities } from "./product-activity-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { recordActivitySchema } from "./product-activity-validation.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

const router = express.Router();

router.get("/", isAuth([systemRoles.USER]), asyncHandler(getActivities));
router.post("/", isAuth([systemRoles.USER]), validationMiddleware(recordActivitySchema), asyncHandler(recordActivity));

export default router;
