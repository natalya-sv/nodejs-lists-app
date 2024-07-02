import dotenv from "dotenv";
import { AUTH_NOT_PROVIDED, USER_NOT_AUTH } from "../../constants.js";
import jsonwebtoken from "jsonwebtoken";

dotenv.config();
const secret = process.env.SECRET_JWT;

//checks if user is authorized
export const isAuth = (req, res, next) => {
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

    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    throw err;
  }
};
