import dotenv from "dotenv";
import {
  AUTH_NOT_PROVIDED,
  USER_NOT_AUTH,
  EMAIL_EXISTS,
  ENTER_VALID_EMAIL,
  USER_NOT_FOUND,
} from "./constants.js";
import jsonwebtoken from "jsonwebtoken";
import { User } from "./api/models/user.js";
import express from "express";
import { createUser, login } from "./api/controllers/user.js";
import { body } from "express-validator";

dotenv.config();
const secret = process.env.SECRET_JWT;

export const router = express.Router();

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

//checks if user is authorized
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new Error(AUTH_NOT_PROVIDED);
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jsonwebtoken.verify(token, secret);

    if (!decodedToken) {
      const error = new Error(USER_NOT_AUTH);
      throw error;
    }
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new Error(USER_NOT_FOUND);
    }
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const generateFieldValidationErrorMessage = (validationError) => {
  let errorMessage = "";
  if (validationError.length > 0) {
    for (let i = 0; i < validationError.length; i++) {
      if (validationError[i].type === "field") {
        errorMessage += `${validationError[i].msg} in ${validationError[i]?.path}. `;
      }
    }
  } else {
    errorMessage = "Error occured!Check your input and try again!";
  }
  return errorMessage;
};
