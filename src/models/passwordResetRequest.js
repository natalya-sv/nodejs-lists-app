import { model, Schema } from "mongoose";

const passwordResetRequestSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    lastRequest: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);
export const PasswordResetRequest = model(
  "PasswordResetRequest",
  passwordResetRequestSchema,
);
