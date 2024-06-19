import { Category } from "../models/category";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.userId;
    const categories = await Category.find({ userId: userId });
    res
      .status(200)
      .json({ message: "Categories fetched", categories: categories });
  } catch (error) {
    next(error);
  }
};
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, icon } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("VALIDATION_FAILED");

      throw error;
    }
    const newCategory = new Category({
      title: title,
      icon: icon,
      userId: req.userId,
    });
    const result = await newCategory.save();
    if (result) {
      res.status(201).json({
        message: "Category created",
        category: newCategory,
      });
    } else {
      throw new Error("Error creating new category");
    }
  } catch (err) {
    next(err);
  }
};
