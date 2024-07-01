import express from "express";
import { body } from "express-validator";
import { User } from "../models/user.js";
import { createUser, login } from "../controllers/user.js";
import { EMAIL_EXISTS, ENTER_VALID_EMAIL } from "../../constants.js";

export const router = express.Router();

router.post("/signup", [
  body("email")
    .isEmail()
    .withMessage(ENTER_VALID_EMAIL)
    .custom((email) => {
      return User.findOne({ email: email }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(EMAIL_EXISTS);
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 7 }),
  body("username").trim().not().isEmpty(),
  createUser,
]);

router.post("/login", login);
