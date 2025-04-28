import { Schema, model } from "mongoose";

const badgeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    badgeType: {
      badgeType: String,
    },
    criteria: { type: String, required: true },
  },
  { timestamps: true },
);

export const Badge = model("Badge", badgeSchema);
