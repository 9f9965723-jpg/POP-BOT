import mongoose from 'mongoose';

const MemoryScoreSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    totalWins: { type: Number, required: true, default: 0 },
    bestDigits: { type: Number, required: true, default: 0 },
    lastWinAt: { type: Date }
  },
  { timestamps: true }
);

export const MemoryScore = mongoose.model('MemoryScore', MemoryScoreSchema);
