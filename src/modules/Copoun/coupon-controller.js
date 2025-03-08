import copounModel from "../../../DB/models/coupon-model.js";
import couponUserModel from "../../../DB/models/coupon-user-model.js";
import userModel from "../../../DB/models/user-model.js";
import { couponValidation } from "./apply-coupon-validation.js";

// Create coupon function
export const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    isForSpecificUsers = false,
    maxUsage = null,
  } = req.body;
  const { _id: addedBy } = req.user;

  // Coupon validation
  const coupon = await copounModel.findOne({ couponCode });
  if (coupon) return next({ message: "Coupon already exists", cause: 409 });

  if (isFixed == isPercentage)
    return next({
      message: "Coupon can be either fixed or percentage",
      cause: 400,
    });

  if (isPercentage && couponAmount > 100)
    return next({ message: "Percentage should be less than 100", cause: 400 });

  // Create coupon
  const couponObject = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,

    isForSpecificUsers,
    maxUsage,
    usageCount: 0,
    addedBy,
  };

  const newCoupon = await copounModel.create(couponObject);

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon: newCoupon,
  });
};

export const assignCopounTouser = async (req, res, next) => {
  const { couponCode, users, maxUsage = 1 } = req.body;

  const coupon = await copounModel.findOne({ couponCode });
  if (!coupon) return next({ message: "Coupon not found", cause: 404 });

  // Verify all users exist
  const existingUsers = await userModel.find({ _id: { $in: users } });
  const existingUsersId = existingUsers.map((user) => user._id.toString());

  const nonExistingUserIds = users.filter(
    (user) => !existingUsersId.includes(user)
  );

  if (nonExistingUserIds.length > 0) {
    return next({
      message: `The following users were not found: ${nonExistingUserIds.join(
        ", "
      )}`,
      cause: 404,
      nonExistingUserIds,
    });
  }

  // Find existing coupon-user assignments
  const existingCouponUsers = await couponUserModel.find({
    couponId: coupon._id,
    userId: { $in: users },
  });

  // Create a map of existing assignments for quick lookup
  const existingUserMap = {};
  existingCouponUsers.forEach((couponUser) => {
    existingUserMap[couponUser.userId.toString()] = couponUser;
  });

  // Results array to track updated and created records
  const updatedUsers = [];
  const newlyAssignedUsers = [];

  // Process each user
  for (const userId of users) {
    if (existingUserMap[userId]) {
      // Update existing assignment
      const couponUser = existingUserMap[userId];
      couponUser.maxUsage = maxUsage;
      await couponUser.save();
      updatedUsers.push(couponUser);
    } else {
      // Create new assignment
      const newCouponUser = await couponUserModel.create({
        userId,
        couponId: coupon._id,
        maxUsage,
      });
      newlyAssignedUsers.push(newCouponUser);
    }
  }

  coupon.isForSpecificUsers = true;
  await coupon.save();

  return res.status(200).json({
    success: true,
    message: "Coupon assignment processed successfully",
    couponCode,
    updated: updatedUsers.length,
    newlyAssigned: newlyAssignedUsers.length,
    updatedUsers,
    newlyAssignedUsers,
  });
};

export const applyCoupon = async (req, res, next) => {
  const userId = req.user._id;

  const { couponCode } = req.body;

  const coupon = await couponValidation(couponCode, userId);

  if (coupon.status) {
    return next({ cause: coupon.status, message: coupon.message });
  }

  res
    .status(200)
    .json({ success: true, message: "Coupon applied successfully" });
};

// Update coupon details
export const updateCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const {
      couponCode,
      couponAmount,
      fromDate,
      toDate,
      isFixed,
      isPercentage,
      couponStatus,
    } = req.body;

    // Check if coupon exists
    const coupon = await copounModel.findById(couponId);
    if (!coupon) return next({ message: "Coupon not found", cause: 404 });

    // Check if trying to update to an existing coupon code (that belongs to another coupon)
    if (couponCode && couponCode !== coupon.couponCode) {
      const existingCoupon = await copounModel.findOne({ couponCode });
      if (existingCoupon)
        return next({ message: "Coupon code already exists", cause: 409 });
    }

    // Validate fixed vs percentage if both are provided
    if (
      isFixed !== undefined &&
      isPercentage !== undefined &&
      isFixed == isPercentage
    ) {
      return next({
        message: "Coupon can be either fixed or percentage",
        cause: 400,
      });
    }

    // Validate percentage amount
    if (isPercentage && couponAmount > 100) {
      return next({
        message: "Percentage should be less than 100",
        cause: 400,
      });
    }

    // Update fields that are provided
    const updateFields = {};
    if (couponCode) updateFields.couponCode = couponCode;
    if (couponAmount !== undefined) updateFields.couponAmount = couponAmount;
    if (fromDate) updateFields.fromDate = fromDate;
    if (toDate) updateFields.toDate = toDate;
    if (isFixed !== undefined) updateFields.isFixed = isFixed;
    if (isPercentage !== undefined) updateFields.isPercentage = isPercentage;
    if (couponStatus) updateFields.couponStatus = couponStatus;

    const updatedCoupon = await copounModel.findByIdAndUpdate(
      couponId,
      updateFields,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    return next(error);
  }
};

// Update coupon user assignments
export const updateCouponAssignments = async (req, res, next) => {
  try {
    const { couponCode } = req.params;
    const { addUsers = [], removeUsers = [], updateMaxUsage } = req.body;

    // Check if coupon exists
    const coupon = await copounModel.findOne({ couponCode });
    if (!coupon) return next({ message: "Coupon not found", cause: 404 });

    // Process users to add (if any)
    if (addUsers.length > 0) {
      // Check if users exist
      const existingUsers = await userModel.find({ _id: { $in: addUsers } });
      const existingUserIds = existingUsers.map((user) => user._id.toString());
      const nonExistingUserIds = addUsers.filter(
        (id) => !existingUserIds.includes(id.toString())
      );

      if (nonExistingUserIds.length > 0) {
        return next({
          message: `The following users were not found: ${nonExistingUserIds.join(
            ", "
          )}`,
          cause: 404,
          nonExistingUserIds,
        });
      }

      // Check which users already have this coupon assigned
      const existingAssignments = await couponUserModel.find({
        couponId: coupon._id,
        userId: { $in: addUsers },
      });

      const alreadyAssignedUserIds = existingAssignments.map((assignment) =>
        assignment.userId.toString()
      );

      // Only create assignments for users who don't already have this coupon
      const usersToAssign = addUsers.filter(
        (id) => !alreadyAssignedUserIds.includes(id.toString())
      );

      if (usersToAssign.length > 0) {
        await couponUserModel.create(
          usersToAssign.map((userId) => ({
            userId,
            couponId: coupon._id,
            maxUsage: updateMaxUsage || 1,
          }))
        );
      }
    }

    // Process users to remove (if any)
    if (removeUsers.length > 0) {
      await couponUserModel.deleteMany({
        couponId: coupon._id,
        userId: { $in: removeUsers },
      });
    }

    // Update max usage for existing assignments if specified
    if (updateMaxUsage) {
      await couponUserModel.updateMany(
        { couponId: coupon._id },
        { maxUsage: updateMaxUsage }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Coupon assignments updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Delete coupon
export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  // Check if coupon exists
  const coupon = await copounModel.findById(couponId);
  if (!coupon) return next({ message: "Coupon not found", cause: 404 });

  // Delete the coupon
  await copounModel.findByIdAndDelete(couponId);

  // Delete all user assignments for this coupon
  await couponUserModel.deleteMany({ couponId });

  return res.status(200).json({
    success: true,
    message: "Coupon and all its assignments deleted successfully",
  });
};
