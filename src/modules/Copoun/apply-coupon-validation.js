import { DateTime } from "luxon";
import couponUserModel from "../../../DB/models/coupon-user-model.js";
import copounModel from "../../../DB/models/coupon-model.js";


export const couponValidation = async (couponCode, userId) => {
  //couponCode check
  const coupon = await copounModel.findOne({ couponCode });
  if (!coupon) return { message: "Coupon not found", status: 404 };

  // expired check
  if (
    coupon.couponStatus === "expired" ||
    DateTime.fromISO(coupon.toDate) < DateTime.now()
  )
    return { message: "Coupon is expired", status: 400 };

  // valid check
  if (DateTime.fromISO(coupon.fromDate) > DateTime.now())
    return { message: "Coupon is not started yet", status: 400 };

  // Check if coupon has reached its global usage limit (if applicable)
  if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
    return {
      message: "Coupon has reached its maximum usage limit",
      status: 400,
    };
  }
 

  // If this is a user-specific coupon, check user assignment
  if (coupon.isForSpecificUsers) {
    // Find the user-coupon assignment
    const userCoupon = await couponUserModel.findOne({
      couponId: coupon._id,
      userId,
    });

    // If no assignment exists, the user can't use this coupon
    if (!userCoupon) {
      return {
        message: "This coupon is not available for your account",
        status: 403,
      };
    }

    // Check if user has reached their individual usage limit
    if (userCoupon.usageCount >= userCoupon.maxUsage) {
      return {
        message: "You have reached the maximum usage limit for this coupon",
        status: 400,
      };
    }
  }
  return coupon;
};
