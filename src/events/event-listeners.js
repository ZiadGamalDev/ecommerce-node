import eventEmitter from "./event-emitter.js";
import { handleProductActivity } from "./handlers/product-activity-handler.js";
import { handleSearchActivity } from "./handlers/search-activity-handler.js";
import logger from "../utils/logger.js";

eventEmitter.on("productActivity", handleProductActivity);
eventEmitter.on("searchActivity", handleSearchActivity);

logger.info("Event listeners are registered");
