import express from "express";
import { recordSearch, getSearchActivities } from "./search-activity-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { systemRoles } from "../../utils/system-roles.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { recordSearchSchema } from "./search-activity-validation.js";
import { validationMiddleware } from "../../Middlewares/validation.js";

const router = express.Router();

router.get("/", isAuth([systemRoles.USER]), asyncHandler(getSearchActivities));
router.post("/", isAuth([systemRoles.USER]), validationMiddleware(recordSearchSchema), asyncHandler(recordSearch));

export default router;
