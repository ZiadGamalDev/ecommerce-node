import Router from "express";
import * as orderController from "./order-controller.js";
import { isAuth } from "../../Middlewares/isAuth.js";
import { asyncHandler } from "../../Middlewares/async-handler.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.post(
  "/",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(orderController.createOrder)
);

router.post(
  "/fromCartToOrder",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(orderController.convertFromCartToOrder)
);

router.get(
  "/",
  isAuth([systemRoles.ADMIN]),
  asyncHandler(orderController.getOrders)
);

router.get(
  "/my-orders",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(orderController.getUserOrders)
);

router.get(
  "/:id",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(orderController.getOrder)
);

router.post(
  "/pay/:orderId",
  isAuth([systemRoles.USER, systemRoles.ADMIN]),
  asyncHandler(orderController.payOrderWithStripe)
);

router.post("/webhook", asyncHandler(orderController.stripeWebHookLocal));

router.post(
  "/refund/:orderId",
  isAuth([systemRoles.ADMIN]),
  asyncHandler(orderController.refundOrder)
);

export default router;
