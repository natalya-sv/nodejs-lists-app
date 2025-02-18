import { Schema, model } from "mongoose";

const userBadgeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  badgeId: {
    type: Schema.Types.ObjectId,
    ref: "Badge",
    required: true,
  },
  unlockedAt: { type: Date, default: Date.now },
});

export const UserBadge = model("UserBadge", userBadgeSchema);
