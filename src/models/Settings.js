import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    gifEnabled: { type: Boolean, required: true, default: true },
    guessEnabled: { type: Boolean, required: true, default: true },
    memoryEnabled: { type: Boolean, required: true, default: true }
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', SettingsSchema);
