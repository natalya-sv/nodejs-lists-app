import { Category } from "../models/category";
import express, { Express, Request, Response, NextFunction } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories fetched", categories: categories });
  } catch (error) {
    next(error);
  }
};
