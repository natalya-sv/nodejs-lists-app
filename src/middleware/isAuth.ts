import { JwtPayload, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface CustomRequest {
    userId: string | JwtPayload;
  }
}
dotenv.config();
const secret = process.env.SECRET_JWT as string;

//checks if user is authorized
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw "No auth header provided";
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = <JwtPayload>verify(token, secret);

    if (!decodedToken) {
      const error = new Error("Not Authenticated");
      throw error;
    }

    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    throw err;
  }
};
