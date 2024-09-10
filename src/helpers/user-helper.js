import {
  AUTH_NOT_PROVIDED,
  USER_NOT_AUTH,
  USER_NOT_FOUND,
} from "../../constants.js";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET_JWT;

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
