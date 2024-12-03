import { PasswordResetRequest } from "../models/passwordResetRequest.js";

export const checkPasswordResetRequest = async (email) => {
  if (!email) {
    return { error: true, message: "Email is required." };
  }
  const timeLimit = 10 * 60 * 1000; //10 min
  const now = Date.now();
  try {
    const passwordRequest = await PasswordResetRequest.findOne({ email });
    if (passwordRequest) {
      const timeSinceLastRequest = now - passwordRequest.lastRequest.getTime();

      if (timeSinceLastRequest < timeLimit) {
        return {
          error: true,
          message:
            "Too many requests for password reset request. Please wait some time before trying again.",
        };
      }

      passwordRequest.lastRequest = now;
      await passwordRequest.save();
    } else {
      await PasswordResetRequest.create({ email, lastRequest: now });
    }
    return { error: false, message: "" };
  } catch (err) {
    return {
      error: true,
      message: JSON.stringify(err),
    };
  }
};
