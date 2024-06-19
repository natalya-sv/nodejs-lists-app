import { JwtPayload, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types";
import { AUTH_NOT_PROVIDED, USER_NOT_AUTH } from "../../constants";

dotenv.config();
const secret = process.env.SECRET_JWT as string;

//checks if user is authorized
export const isAuth = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new Error(AUTH_NOT_PROVIDED);
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = <JwtPayload>verify(token, secret);

    if (!decodedToken) {
      const error = new Error(USER_NOT_AUTH);
      throw error;
    }

    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    throw err;
  }
};
