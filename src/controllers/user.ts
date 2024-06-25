import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import dotenv from "dotenv";
import {
  ENTER_VALID_INPUT,
  PASSWORD_RULES,
  PASSWORD_WPONG,
  POST_USER_SUCCESS,
  USER_NOT_FOUND,
} from "../../constants";

dotenv.config();

const secret = process.env.SECRET_JWT as string;

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      throw error;
    }
    const { email, username, password } = req.body;

    if (password.trim().length < 7) {
      throw new Error(PASSWORD_RULES);
    }
    const hashedPassword = await hash(password.trim(), 12);
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    res.status(201).json({ message: POST_USER_SUCCESS, user: createdUser });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let loadedUser;
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error(USER_NOT_FOUND);
      throw error;
    } else {
      loadedUser = user;
      const isEqual = await compare(password, user.password);

      if (!isEqual) {
        const error = new Error(PASSWORD_WPONG);
        throw error;
      }

      if (loadedUser) {
        const token = sign(
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
    next(err);
  }
};
