import Stripe from "stripe";
import Coupon from "../../../DB/models/coupon-model.js";

export const createCheckOutSession = async ({
  customer_email,
  discounts,
  line_items,
  orderId,
}) => {
  // stripe connection
  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    discounts,
    line_items,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    metadata: { orderId },
  });
  return checkoutSession;
};

// create coupon from stripe
export const createStripeCoupon = async (couponId) => {
  const couponDetails = await Coupon.findById(couponId);
  if (!couponDetails) return next({ message: "Coupon not found", status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  let couponObject = {};
  if (couponDetails.isFixed) {
    couponObject = {
      name: couponDetails.couponCode,
      amount_off: couponDetails.couponAmount * 100,
      currency: "EGP",
    };
  }

  if (couponDetails.isPercentage) {
    couponObject = {
      name: couponDetails.couponCode,
      percent_off: couponDetails.couponAmount,
    };
  }

  const coupon = await stripe.coupons.create(couponObject);
  return coupon;
};

// create payment method
export const createPaymentMethod = async (token) => {
  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token: token,
    },
  });
  return paymentMethod;
};

// create payment Intent
// create payment Intent
export const createPaymentIntent = async (amount) => {
  const paymentMethod = await createPaymentMethod("tok_visa");
  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Round to ensure integer
    currency: "EGP",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};
// retrieve payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
};

// payment intent confirmation
export const confirmPaymentIntent = async (paymentIntentId) => {
  const paymentIntentDetails = await retrievePaymentIntent(paymentIntentId);

  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentIntentDetails.payment_method,
  });
  return paymentIntent;
};

// refund payment
export const refundPayment = async (paymentIntentId) => {
  const stripe = new Stripe(process.env.STRIPE_SECRTE_KEY);
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
  return refund;
};
