import { DateTime } from "luxon";
import Coupon from "../../DB/Models/coupon.model.js";
import CouponUsers from "../../DB/Models/coupon-users.model.js";

export const couponValidation = async (couponCode, userId) => {
  //couponCode check
  const coupon = await Coupon.findOne({ couponCode });
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

  // user assgined to coupon or not
  const isUserAssigned = await CouponUsers.findOne({
    couponId: coupon._id,
    userId,
  });
  if (!isUserAssigned)
    return { message: "Coupon is not assigned to you", status: 400 };

  // user exceeded the max usage or not
  if (isUserAssigned.usageCount >= isUserAssigned.maxUsage)
    return { message: "Coupon exceeded the max usage", status: 400 };

  return coupon;
};
