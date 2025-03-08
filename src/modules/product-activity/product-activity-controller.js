import ProductActivity from "../../../DB/models/product-activity-model.js";
import eventEmitter from "../../events/event-emitter.js";

export const getActivities = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const { _id: userId } = req.user;
    const filter = {};

    if (userId) filter.userId = userId;
    if (productId) filter.productId = productId;

    const activities = await ProductActivity.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({ message: "Product activities retreived successfully", data: activities });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving activities", error: error.message });
  }
};

export const recordActivity = async (req, res, next) => {
  try {
    const { productId, duration, price, action } = req.body;
    const { _id: userId } = req.user;

    const activity = new ProductActivity({ userId, productId, duration, price, action });
    await activity.save();

    eventEmitter.emit("productActivity", activity);

    res.status(201).json({ message: "Product activity recorded successfully", data: activity});
  } catch (error) {
    res.status(500).json({ message: "Error recording activity", error: error.message });
  }
};

