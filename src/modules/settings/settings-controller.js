import settingsInstance from "../../services/settings-service.js";

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsInstance.getSettings();
    
    res.status(200).json({ message: "Settings retrieved successfully", data: settings });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving settings", error: error.message });
  }
};

export const saveSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    await settingsInstance.updateMultipleSettings(settings);
    const updatedSettings = await settingsInstance.getSettings();

    res.status(201).json({ message: "Settings saved successfully", data: updatedSettings });
  } catch (error) {
    res.status(500).json({ message: "Error saving settings", error: error.message });
  }
};


