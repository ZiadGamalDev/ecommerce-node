import ProductActivity from "../../../DB/models/product-activity-model.js";
import settingsInstance from "../../services/settings-service.js";
import logger from "../../utils/logger.js";
import sendDiscount from "../actions/send-discount.js";

export const handleProductActivity = async (activity) => {
  logger.info("Handling Product Activity:", activity._id);

  const settings = await settingsInstance.getSettings();

  switch (activity.action) {
    case "view":
      handleViewActivity(activity, settings);
      return;
    case "addToCart":
      logger.info("User added product to cart", activity.productId);
      break;
    default:
      logger.info("Unknown action:", activity.action);
  }
};

const handleViewActivity = async ({ userId, productId }, { productViewThreshold }) => {
  const viewCount = await ProductActivity.countDocuments({ userId, productId, action: "view" });

  if (viewCount >= productViewThreshold) {
    logger.info(`User viewed product ${productViewThreshold} times. Sending discount...`);

    sendDiscount({ userId, productId });
  }
}
