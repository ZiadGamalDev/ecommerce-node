import User from "../../../DB/models/user-model.js";
import Coupon from '../../../DB/models/coupon-model.js'
import CouponUser from '../../../DB/models/coupon-user-model.js'
import settingsInstance from "../../services/settings-service.js";
import sendEmailService from "../../services/send-email.js";
import logger from "../../utils/logger.js";

export default async function sendDiscount({ userId, productId }) {
  logger.info(`Sending discount to user ${userId} for product ${productId}`);

  const settings = await settingsInstance.getSettings();

  const coupon = await generateCoupon(settings);

  await assignCoupon(userId, coupon, settings);

  await sendEmail(userId, coupon);
};

const generateCoupon = async ({ discountPersentage, discountExpirationDays }) => {
  const fromDate = new Date().toISOString();
  const toDate = new Date(Date.now() + discountExpirationDays * 86400000).toISOString();
  const couponCode = `SPECIAL-COUPON-${fromDate}`;

  logger.info(`Generated discount code: ${couponCode}`);

  const coupon = await Coupon.create({
    couponAmount: discountPersentage,
    couponCode,
    fromDate,
    toDate,
    couponStatus: "valid",
    isPercentage: true,
    isFixed: false,
  });

  return coupon;
};

const assignCoupon = async (userId, { _id }, { maxCouponUsage }) => {
  const couponUser = await CouponUser.create({
    userId,
    couponId: _id,
    maxUsage: maxCouponUsage,
    usageCount: 0,
  });
  
  logger.info(`Assigned coupon ${_id} to user ${userId}`);

  return couponUser;
};

const sendEmail = async (userId, { couponAmount, couponCode }) => {
  const user = await User.findById(userId);
  const to = user.email;
  const subject = "🎉 You got a discount!";
  const message = `🎉 You got a ${couponAmount}% discount on this product! Use code: ${couponCode}`;

  logger.info(`Sending discount email to ${to}`);

  return await sendEmailService({ to, subject, message });
}
