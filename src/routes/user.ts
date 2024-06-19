import express from "express";
export const router = express.Router();

import { body } from "express-validator";
import { User } from "../models/user";
import { createUser, login } from "../controllers/user";

router.post("/signup", [
  body("email")
    .isEmail()
    .withMessage("Please enter valid email")
    .custom((email: string, { req: Request }) => {
      return User.findOne({ email: email }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email already exists");
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 7 }),
  body("username").trim().not().isEmpty(),
  createUser,
]);

router.post("/login", login);
