import dotenv from "dotenv";
import { EMAIL_EXISTS, ENTER_VALID_EMAIL } from "../../constants.js";
import { User } from "../models/user.js";
import express from "express";
import {
  createUser,
  login,
  resetPasswordRequest,
  changePassword,
  resetPassword,
} from "../../api/controllers/user-controller.js";
import { body } from "express-validator";

export const router = express.Router();
dotenv.config();

router.post("/signup", [
  body("email")
    .isEmail()
    .withMessage(ENTER_VALID_EMAIL)
    .custom(async (email) => {
      const userDoc = await User.findOne({ email: email });
      if (userDoc) {
        return Promise.reject(EMAIL_EXISTS);
      }
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 7 }),
  body("username").trim().not().isEmpty(),
  createUser,
]);

router.post("/login", login);
router.post("/reset-password-request", resetPasswordRequest);
router.get("/change-password", changePassword);
router.post("/reset-password", resetPassword);
