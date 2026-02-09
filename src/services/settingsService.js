import { Settings } from '../models/Settings.js';

const SETTINGS_KEY = 'global';

export async function getGlobalSettings() {
  const doc = await Settings.findOne({ key: SETTINGS_KEY }).lean();
  if (doc) return doc;

  const created = await Settings.create({ key: SETTINGS_KEY });
  return created.toObject();
}

export async function updateGlobalSettings(patch) {
  const updated = await Settings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $set: {
        ...(typeof patch.gifEnabled === 'boolean' ? { gifEnabled: patch.gifEnabled } : {}),
        ...(typeof patch.guessEnabled === 'boolean' ? { guessEnabled: patch.guessEnabled } : {}),
        ...(typeof patch.memoryEnabled === 'boolean' ? { memoryEnabled: patch.memoryEnabled } : {})
      }
    },
    { new: true, upsert: true }
  ).lean();

  return updated;
}
