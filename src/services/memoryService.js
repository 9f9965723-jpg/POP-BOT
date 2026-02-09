import { MemoryScore } from '../models/MemoryScore.js';

export async function recordMemoryWin({ userId, digits }) {
  const updated = await MemoryScore.findOneAndUpdate(
    { userId },
    {
      $inc: { totalWins: 1 },
      $max: { bestDigits: digits },
      $set: { lastWinAt: new Date() }
    },
    { new: true, upsert: true }
  ).lean();

  return updated;
}

export async function getTopMemoryLeaderboard(limit = 10) {
  const docs = await MemoryScore.find({})
    .sort({ bestDigits: -1, totalWins: -1, lastWinAt: 1 })
    .limit(limit)
    .lean();

  return docs;
}
