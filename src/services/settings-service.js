import Settings from "../../DB/models/settings-model.js";

class SettingsService {
  constructor() {
    if (!SettingsService.instance) {
      this.settingsCache = new Map();
      this.loaded = false;
      SettingsService.instance = this;
    }
    return SettingsService.instance;
  }

  async loadSettings() {
    const settings = await Settings.find({});
    this.settingsCache.clear();
    settings.forEach(({ key, value }) => {
      this.settingsCache.set(key, value);
    });
    this.loaded = true;
  }

  async getSettings(forceRefresh = false) {
    if (!this.loaded || forceRefresh) {
      await this.loadSettings();
    }
    return Object.fromEntries(this.settingsCache);
  }

  async getSettingByKey(key) {
    if (!this.loaded) {
      await this.loadSettings();
    }
    return this.settingsCache.get(key) ?? null;
  }

  async updateSetting(key, value) {
    await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    this.settingsCache.set(key, value);
  }

  async updateMultipleSettings(settingsArray) {
    if (!Array.isArray(settingsArray) || settingsArray.length === 0) {
      throw new Error("Invalid settings array");
    }

    await Settings.bulkWrite(
      settingsArray.map(({ key, value }) => ({
        updateOne: {
          filter: { key },
          update: { key, value },
          upsert: true,
        },
      }))
    );

    await this.loadSettings();
  }

  async clearCache() {
    this.settingsCache.clear();
    this.loaded = false;
  }
}

const settingsInstance = new SettingsService();
export default settingsInstance;
