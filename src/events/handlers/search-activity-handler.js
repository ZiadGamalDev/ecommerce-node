import settingsInstance from "../../services/settings-service.js";
import logger from "../../utils/logger.js";
import SearchActivity from "../../../DB/models/search-activity-model.js";
import sendDiscount from "../actions/send-discount.js";

export const handleSearchActivity = async (activity) => {
  logger.info("Handling Search Activity:", activity._id);

  const settings = await settingsInstance.getSettings();

  await checkSpecialKeywords(activity, settings);

  await checkSearchThreshold(activity, settings);
};

const checkSearchThreshold = async ({ userId, searchQuery }, { searchTriggerThreshold }) => {
  const searchCount = await SearchActivity.countDocuments({ userId, searchQuery });

  if (searchCount >= searchTriggerThreshold) {
    logger.info(`User searched for "${searchQuery}" ${searchCount} times. Sending discount...`);

    const productId = await findClosestProduct(searchQuery);
    sendDiscount({ userId, productId });

    return true;
  }

  return false;
};

const findClosestProduct = async (searchQuery) => {
  // Todo: Implement this function
  return "ClosestProductId";  
};

const checkSpecialKeywords = async ({ searchQuery }, { specialKeywords }) => {
  specialKeywords = specialKeywords || ["discount", "offer"];
  const isThereSpecialKeyword = specialKeywords.some((keyword) => searchQuery.includes(keyword))

  if (isThereSpecialKeyword) {
    logger.info("User searched for a high-value keyword. Considering special offers...");

    // Take action here

    return true;
  }

  return false;
};
