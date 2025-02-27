import { Schema, model } from "mongoose";

const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
});

const Settings = model("Settings", settingsSchema);

export default Settings;
