import {
  CATEGORIES_LIMIT_ERROR,
  GET_CATEGORIES_FAILURE,
  GET_CATEGORY_SUCCESS,
  POST_CATEGORY_ERROR,
} from "../../constants.js";
import { Category } from "../../src/models/category.js";
import { validationResult } from "express-validator";
import {
  DELETE_CATEGORIES_SUCCESS,
  GET_CATEGORIES_SUCCESS,
  POST_CATEGORIES_SUCCESS,
  POST_CATEGORY_TITLE_ERROR,
  PUT_CATEGORIES_SUCCESS,
} from "../../constants.js";
import { setError } from "../../src/utils.js";
import {
  categoryExists,
  countCategories,
} from "../../src/helpers/category-helper.js";

export const getTestData = (req, res) => {
  res.status(200).json({ message: "Test message is returned" });
};

export const getCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req?.userId;

    const categoryItem = await categoryExists(categoryId, userId);

    if (categoryItem.category) {
      res.status(200).json({
        message: GET_CATEGORY_SUCCESS,
        category: categoryItem.category,
        error: false,
      });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      category: null,
      error: true,
    });
  }
};
export const getCategories = async (req, res) => {
  try {
    const userId = req?.userId;
    const categories = await Category.find({ userId: userId });

    if (categories) {
      res.status(200).json({
        message: GET_CATEGORIES_SUCCESS,
        categories: categories,
        error: false,
      });
    } else {
      throw new Error(GET_CATEGORIES_FAILURE);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      categories: [],
      error: true,
    });
  }
};
export const addCategory = async (req, res) => {
  let category = null;
  try {
    const { title, icon, color } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;

    setError(errors);

    const count = await countCategories(userId);
    if (count.error) {
      throw new Error(count.message);
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
        category = newCategory;
        res.status(201).json({
          message: POST_CATEGORIES_SUCCESS,
          category: newCategory,
          error: false,
        });
      } else {
        throw new Error(POST_CATEGORY_ERROR);
      }
    } else {
      throw new Error(POST_CATEGORY_TITLE_ERROR);
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      category: category,
      error: true,
    });
  }
};

export const updateCategory = async (req, res) => {
  let category = null;
  try {
    const { title, icon, color } = req.body;
    const errors = validationResult(req);
    setError(errors);
    const userId = req.userId;
    const categoryId = req.params.categoryId;

    const categoryItem = await categoryExists(categoryId, userId);
    if (categoryItem.category) {
      categoryItem.category.title = title ?? categoryItem.category.title;
      categoryItem.category.icon = icon ?? categoryItem.category.icon;
      categoryItem.category.color = color ?? categoryItem.category.color;
      category = categoryItem.category;

      const updatedCategory = await categoryItem.category.save();
      res.status(200).json({
        message: PUT_CATEGORIES_SUCCESS,
        category: updatedCategory,
        error: false,
      });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      category: category,
      error: true,
    });
  }
};
export const deleteCategory = async (req, res) => {
  let category = null;
  try {
    const categoryId = req.params.categoryId;
    const userId = req.userId;
    const categoryItem = await categoryExists(categoryId, userId);

    if (categoryItem.category) {
      category = categoryItem.category;
      await Category.findByIdAndRemove(categoryId);
      res.status(200).json({
        message: DELETE_CATEGORIES_SUCCESS,
        error: false,
        category: category,
      });
    } else {
      throw new Error(categoryItem.error);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      category: category,
      error: true,
    });
  }
};
