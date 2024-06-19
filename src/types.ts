import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface CustomRJwtPayload extends JwtPayload {
  userId: string;
}
export interface DecodedToken {
  email: string;
  userId: string;
  iat: number;
  exp: number;
}
export type CustomRequest = Request & {
  userId?: string;
  body?: {
    title: string;
    icon: string;
  };
  params?: { categoryId: string };
};
