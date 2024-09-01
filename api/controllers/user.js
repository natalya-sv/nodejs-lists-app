import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { validationResult } from "express-validator";
import { User } from "../models/user.js";
import dotenv from "dotenv";
import {
  ENTER_VALID_INPUT,
  PASSWORD_RULES,
  PASSWORD_WPONG,
  POST_USER_SUCCESS,
  USER_NOT_FOUND,
} from "../../constants.js";

dotenv.config();

const secret = process.env.SECRET_JWT;

export const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(ENTER_VALID_INPUT);
    }
    const { email, username, password } = req.body;

    if (password.trim().length < 7) {
      throw new Error(PASSWORD_RULES);
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 12);
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    res.status(201).json({ message: POST_USER_SUCCESS, user: createdUser });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const login = async (req, res, next) => {
  try {
    let loadedUser;
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw Error(USER_NOT_FOUND);
    } else {
      loadedUser = user;
      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        const error = new Error(PASSWORD_WPONG);
        throw new Error(error?.message);
      }

      if (loadedUser) {
        const token = jsonwebtoken.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
          },
          secret,
          { expiresIn: "10 days" }
        );

        res.status(200).json({
          token: token,
          user: {
            id: loadedUser._id.toString(),
            username: loadedUser.username,
            email: loadedUser.email,
          },
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
