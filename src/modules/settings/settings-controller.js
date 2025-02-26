import Settings from "../../../DB/models/settings-model.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find().sort({ createdAt: -1 });
    
    res.status(200).json({ message: "Settings retrieved successfully", data: settings });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving settings", error: error.message });
  }
};

export const saveSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    await Settings.bulkWrite(
      settings.map(({ key, value }) => ({
        updateOne: {
          filter: { key },
          update: { key, value },
          upsert: true,
        },
      }))
    );

    const updatedSettings = await Settings.find().select("-__v").sort({ createdAt: -1 });

    res.status(201).json({ message: "Settings saved successfully", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error saving settings", error: error.message });
  }
};
