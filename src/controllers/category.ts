import {
  CATEGORY_NOT_FOUND,
  NOT_AUTHORIZED,
  POST_CATEGORY_ERROR,
} from "./../../constants";
import { Category } from "../models/category";
import { Response, NextFunction } from "express";
import { FieldValidationError, validationResult } from "express-validator";
import { CustomRequest } from "../types";
import {
  DELETE_CATEGORIES_SUCCESS,
  ENTER_VALID_INPUT,
  GET_CATEGORIES_SUCCESS,
  POST_CATEGORIES_SUCCESS,
  PUT_CATEGORIES_SUCCESS,
  USER_NOT_FOUND,
} from "../../constants";
import { generateFieldValidationErrorMessage } from "../../utils";

export const getCategories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.userId;
    if (userId) {
      const categories = await Category.find({ userId: userId });
      res
        .status(200)
        .json({ message: GET_CATEGORIES_SUCCESS, categories: categories });
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
};
export const addCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, icon } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(
          errors.array() as FieldValidationError[]
        );
      }
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
        message: POST_CATEGORIES_SUCCESS,
        category: newCategory,
      });
    } else {
      throw new Error(POST_CATEGORY_ERROR);
    }
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, icon } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(
          errors.array() as FieldValidationError[]
        );
      }
      throw error;
    }
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error(CATEGORY_NOT_FOUND);
      throw error;
    }
    category.title = title ?? category.title;
    category.icon = icon ?? category.icon;

    const updatedCategory = await category.save();
    res
      .status(200)
      .json({ message: PUT_CATEGORIES_SUCCESS, goal: updatedCategory });
  } catch (err) {
    next(err);
  }
};
export const deleteCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error(CATEGORY_NOT_FOUND);
      throw error;
    }
    if (category.userId.toString() !== req.userId) {
      const error = new Error(NOT_AUTHORIZED);
      throw error;
    }
    await Category.findByIdAndRemove(categoryId);
    res.status(200).json({ message: DELETE_CATEGORIES_SUCCESS });
  } catch (err) {
    next(err);
  }
};
