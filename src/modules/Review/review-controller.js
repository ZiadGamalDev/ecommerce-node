import Review from "../../../DB/models/review-model.js";
import Product from "../../../DB/models/product-model.js";
import mongoose from "mongoose";

//============================== Get Reviews for a Product ==============================//
export const getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    const reviews = await Review.find({ productId });

    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

//============================== Add Review ==============================//
export const addReview = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { productId, reviewRate, reviewComment } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = new Review({ userId, productId, reviewRate, reviewComment });
    await review.save();

    await updateProductRating(productId);

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    next(error);
  }
};

//============================== Update Review ==============================//
export const updateReview = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { reviewId } = req.params;
    const { reviewRate, reviewComment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, userId },
      { reviewRate, reviewComment },
      { new: true }
    );

    if (!review)
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });

    await updateProductRating(review.productId);

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    next(error);
  }
};

//============================== Delete Review ==============================//
export const deleteReview = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    if (!review)
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });

    await updateProductRating(review.productId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};

//============================== Update Product Rating ==============================//
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ productId });
  const totalRating = reviews.reduce(
    (sum, review) => sum + review.reviewRate,
    0
  );
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Product.findByIdAndUpdate(productId, {
    rate: averageRating.toFixed(1),
  });
};
