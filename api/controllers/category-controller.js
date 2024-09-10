import {
  GET_CATEGORIES_FAILURE,
  GET_CATEGORY_SUCCESS,
  POST_CATEGORY_ERROR,
} from "../../constants.js";
import { Category } from "../models/category.js";
import { validationResult } from "express-validator";
import {
  DELETE_CATEGORIES_SUCCESS,
  ENTER_VALID_INPUT,
  GET_CATEGORIES_SUCCESS,
  POST_CATEGORIES_SUCCESS,
  POST_CATEGORY_TITLE_ERROR,
  PUT_CATEGORIES_SUCCESS,
} from "../../constants.js";
import { generateFieldValidationErrorMessage } from "../../utils.js";
import { categoryExists } from "../../helpers/category-helper.js";

export const getTestData = (req, res) => {
  res.status(200).json({ message: "Test message is returned" });
};

export const getCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req?.userId;

    const categoryItem = await categoryExists(categoryId, userId);

    if (categoryItem.category) {
      res.status(200).json({
        message: GET_CATEGORY_SUCCESS,
        category: categoryItem.category,
      });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getCategories = async (req, res, next) => {
  try {
    const userId = req?.userId;
    const categories = await Category.find({ userId: userId });

    if (categories) {
      res
        .status(200)
        .json({ message: GET_CATEGORIES_SUCCESS, categories: categories });
    } else {
      throw new Error(GET_CATEGORIES_FAILURE);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const addCategory = async (req, res, next) => {
  try {
    const { title, icon, color } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
    }

    const categoryExists = await Category.findOne({
      title: title,
      userId: userId,
    });
    if (!categoryExists) {
      const newCategory = new Category({
        title: title,
        icon: icon,
        userId: userId,
        color: color,
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
    } else {
      res.status(500).json({
        message: POST_CATEGORY_TITLE_ERROR,
        category: null,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { title, icon, color } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;
    const categoryId = req.params.categoryId;

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
    }
    const categoryItem = await categoryExists(categoryId, userId);
    if (categoryItem.category) {
      categoryItem.category.title = title ?? categoryItem.category.title;
      categoryItem.category.icon = icon ?? categoryItem.category.icon;
      categoryItem.category.color = color ?? categoryItem.category.color;

      const updatedCategory = await categoryItem.category.save();
      res
        .status(200)
        .json({ message: PUT_CATEGORIES_SUCCESS, category: updatedCategory });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req.userId;
    const categoryItem = await categoryExists(categoryId, userId);

    if (categoryItem.category) {
      await Category.findByIdAndRemove(categoryId);
      res.status(200).json({ message: DELETE_CATEGORIES_SUCCESS });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
