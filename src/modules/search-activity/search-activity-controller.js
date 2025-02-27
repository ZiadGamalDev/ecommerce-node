import SearchActivity from "../../../DB/models/search-activity-model.js";
import eventEmitter from "../../events/event-emitter.js";

export const getSearchActivities = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const filter = { userId };

    const activities = await SearchActivity.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ message: "Search activities retrieved successfully", data: activities });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving search activities", error: error.message });
  }
};

export const recordSearch = async (req, res, next) => {
  try {
    const { searchQuery } = req.body;
    const { _id: userId } = req.user;

    const activity = new SearchActivity({ userId, searchQuery });
    await activity.save();

    eventEmitter.emit("searchActivity", activity);

    res.status(201).json({ message: "Search activity recorded successfully", data: activity });
  } catch (error) {
    res.status(500).json({ message: "Error recording search activity", error: error.message });
  }
};
