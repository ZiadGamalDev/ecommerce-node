import { DateTime } from "luxon";
import cartModel from "../../../DB/models/cart-model.js";
import couponUserModel from "../../../DB/models/coupon-user-model.js";
import orderModel from "../../../DB/models/order-model.js";
import productModel from "../../../DB/models/product-model.js";
import {
  confirmPaymentIntent,
  createCheckOutSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPayment,
} from "../../services/payment-handler/stripe.js";
import { checkproductAvaliability } from "../../utils/product-cart-utils/check-product-avaliability.js";
import { couponValidation } from "../Copoun/apply-coupon-validation.js";

export const createOrder = async (req, res, next) => {
  // Destructuring the request body
  const {
    product,
    quantity,
    couponCode,
    paymentMethod,
    address,
    city,
    postalCode,
    country,
    phoneNumbers,
  } = req.body;

  // Destructuring the user from request authUser
  const { _id: userId } = req.user;

  // Coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, userId);
    if (isCouponValid.status) {
      return next({
        message: isCouponValid.message,
        status: isCouponValid.status,
      });
    }

    coupon = isCouponValid;
  }

  // Product check
  const isProductAvailable = await checkproductAvaliability(product, quantity);
  if (!isProductAvailable) {
    return next({
      message: "Product is not available or insufficient stock",
      status: 400,
    });
  }

  const orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      product: isProductAvailable._id,
    },
  ];

  // Shipping price calculation
  const shippingPrice = isProductAvailable.appliedPrice * quantity;
  let totalPrice = shippingPrice;

  // Apply coupon discount if available
  if (coupon) {
    if (coupon.isFixed && coupon.couponAmount > shippingPrice) {
      return next({
        message: "Cannot apply this coupon for this order",
        status: 400,
      });
    }

    if (coupon.isFixed && coupon.couponAmount <= shippingPrice) {
      totalPrice = shippingPrice - coupon.couponAmount;
    } else if (coupon.isPercentage) {
      totalPrice = shippingPrice - shippingPrice * (coupon.couponAmount / 100);
    }
  }

  // Set order status based on payment method
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // Create order object
  const orderObject = {
    userId,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  };

  // Create order
  const order = await orderModel.create(orderObject);
  if (!order) {
    return next({
      message: "Order creation failed",
      status: 500,
    });
  }

  // Decrease the stock of the product
  isProductAvailable.stock -= quantity;
  await isProductAvailable.save();

  // Update coupon usage
  if (coupon) {
    // First, update global coupon usage if applicable
    if (coupon.maxUsage !== null) {
      coupon.usageCount = (coupon.usageCount || 0) + 1;
      await coupon.save();
    }

    // Then, check if this is a user-specific coupon and update user's usage
    if (coupon.isForSpecificUsers) {
      const userCoupon = await couponUserModel.findOne({
        couponId: coupon._id,
        userId: userId,
      });
      if (userCoupon) {
        userCoupon.usageCount += 1;
        await userCoupon.save();
      }
    }
  }

  // Return the created order
  res
    .status(201)
    .json({ success: true, message: "Order placed successfully", data: order });
};

export const convertFromCartToOrder = async (req, res, next) => {
  // Destructuring the request body
  const {
    couponCode,
    paymentMethod,
    address,
    city,
    postalCode,
    country,
    phoneNumbers,
  } = req.body;

  // Destructuring the user from request authUser
  const { _id: userId } = req.user;

  // Find user cart
  const userCart = await cartModel.findOne({ userId });
  if (!userCart) return next({ message: "Cart not found", status: 404 });

  // Coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, userId);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        status: isCouponValid.status,
      });

    coupon = isCouponValid;
  }

  // Create order items from cart products
  const orderItems = userCart.products.map((product) => {
    return {
      title: product.title,
      quantity: product.quantity,
      price: product.basePrice,
      product: product.productId,
    };
  });

  // Shipping price calculation
  const shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  // Apply coupon discount if available
  if (coupon?.isFixed && coupon?.couponAmount > shippingPrice) {
    return next({
      message: "Cannot apply this coupon for this order",
      cause: 400,
    });
  }
  if (coupon?.isFixed && coupon?.couponAmount <= shippingPrice) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - shippingPrice * (coupon.couponAmount / 100);
  }

  // Set order status based on payment method
  let orderStatus;
  if (paymentMethod === "Cash") {
    orderStatus = "Placed";
  }

  // Create order object
  const orderObject = {
    userId,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  };

  // Create order
  const order = await orderModel.create(orderObject);
  if (!order) return next({ message: "Order creation failed", status: 500 });

  // Decrease the stock of each product
  const productUpdatePromises = order.orderItems.map(async (item) => {
    const product = await productModel.findById(item.product);
    if (product) {
      product.stock -= item.quantity;
      return product.save();
    }

    return Promise.resolve();
  });

  await Promise.all(productUpdatePromises);

  // Update coupon usage
  if (coupon) {
    // Update global coupon usage counter
    coupon.usageCount = (coupon.usageCount || 0) + 1;
    await coupon.save();

    // Update user-specific coupon usage if applicable
    if (coupon.isForSpecificUsers) {
      const userCoupon = await couponUserModel.findOne({
        couponId: coupon._id,
        userId,
      });
      if (userCoupon) {
        userCoupon.usageCount += 1;
        await userCoupon.save();
      }
    }
  }

  // Delete the user cart
  await cartModel.findByIdAndDelete(userCart._id);

  res
    .status(201)
    .json({ success: true, message: "order placed successfully", data: order });
};

export const getOrders = async (req, res, next) => {
  const orders = await orderModel.find();

  if (!orders) {
    return next({ message: "Failed to fetch orders", cause: 404 });
  }
  return res.json({
    success: true,
    message: "Orders fetched successfully",
    data: orders,
  });
};

export const getOrder = async (req, res, next) => {
  const { id } = req.params;

  const order = await orderModel.findById(id);

  if (!order) {
    return next({ message: "Order not found", cause: 404 });
  }

  return res.json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
};

export const getUserOrders = async (req, res, next) => {
  const userId = req.user._id;

  const orders = await orderModel.find({ userId });

  if (!orders) {
    return next({ message: "Failed to fetch user orders", cause: 404 });
  }

  return res.json({
    success: true,
    message: "User orders fetched successfully",
    data: orders,
  });
};

export const payOrderWithStripe = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
    orderStatus: "Pending",
  });
  if (!order) return next({ message: "Order not found", status: 404 });

  const checkoutObject = {
    customer_email: req.user.email,
    discounts: [],
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100), // Ensure integer value
        },
        quantity: item.quantity,
      };
    }),
    orderId: order._id.toString(),
  };
  // coupon
  if (order.coupon) {
    const coupon = await createStripeCoupon(order.coupon);
    checkoutObject.discounts.push({ coupon: coupon.id });
  }
  const checkoutSession = await createCheckOutSession(checkoutObject);

  const paymentIntent = await createPaymentIntent(order.totalPrice);

  order.payment_intent = paymentIntent.id;
  await order.save();
  res.status(200).json({ checkoutSession, paymentIntent });
};

export const stripeWebHookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;
  const order = await orderModel.findById(orderId);

  await confirmPaymentIntent(order.payment_intent);

  order.orderStatus = "Paid";
  order.isPaid = true;
  order.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  await order.save();

  res.status(200).json({ message: "ok" });
};

export const refundOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findOne({ _id: orderId, orderStatus: "Paid" });
  if (!order) return next({ message: "Order not found", status: 404 });

  const refundPaymenttes = await refundPayment(order.payment_intent);

  order.orderStatus = "Refunded";
  await order.save();

  res.status(200).json({ refundPaymenttes });
};
