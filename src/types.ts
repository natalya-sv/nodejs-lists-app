import { JwtPayload } from "jsonwebtoken";

export interface CustomRJwtPayload extends JwtPayload {
  userId: string;
}
export interface DecodedToken {
  email: string;
  userId: string;
  iat: number;
  exp: number;
}
