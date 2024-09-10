import { Subcategory } from "../models/subcategory.js";
import { validationResult } from "express-validator";
import { generateFieldValidationErrorMessage } from "../../utils.js";
import {
  DELETE_SUBCATEGORIES_SUCCESS,
  ENTER_VALID_INPUT,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORY_SUCCESS,
  NOT_AUTHORIZED,
  POST_SUBCATEGORIES_SUCCESS,
  POST_SUBCATEGORY_ERROR,
  POST_SUBCATEGORY_NOT_FOUND_ERROR,
  POST_SUBCATEGORY_TITLE_ERROR,
  PUT_SUBCATEGORIES_SUCCESS,
  SUBCATEGORIES_NOT_FOUND,
  SUBCATEGORY_NOT_FOUND,
  USER_NOT_FOUND,
} from "../../constants.js";
import { Category } from "../models/category.js";
import { subcategoryExists } from "../../helpers/subcategory-helper.js";

export const getSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;
    if (subcategoryId) {
      const subcategoryItem = await subcategoryExists(subcategoryId, userId);

      if (subcategoryItem.subcategory) {
        res.status(200).json({
          message: GET_SUBCATEGORY_SUCCESS,
          subcategory: subcategoryItem.subcategory,
        });
      } else {
        throw new Error(subcategoryItem.error);
      }
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
};
export const getAllSubcategories = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subcategories = await Subcategory.find({
      userId: userId,
    });

    res.status(200).json({
      message: GET_SUBCATEGORIES_SUCCESS,
      subcategories: subcategories,
    });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
};
export const getSubcategories = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req.userId;
    if (categoryId) {
      const subcategories = await Subcategory.find({
        categoryId: categoryId,
        userId: userId,
      });

      res.status(200).json({
        message: GET_SUBCATEGORIES_SUCCESS,
        subcategories: subcategories,
      });
    } else {
      throw new Error(SUBCATEGORIES_NOT_FOUND);
    }
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
};
export const addSubcategory = async (req, res, next) => {
  try {
    const { title } = req.body;
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
    if (categoryId) {
      const hasCategory = await Category.findById(categoryId);
      if (hasCategory && hasCategory.userId.toString() === userId) {
        const subcategoryExists = await Subcategory.findOne({
          title: title,
          userId: userId,
        });

        if (!subcategoryExists) {
          const newSubcategory = new Subcategory({
            title: title,
            categoryId: categoryId,
            userId: userId,
          });
          const result = await newSubcategory.save();
          if (result) {
            res.status(201).json({
              message: POST_SUBCATEGORIES_SUCCESS,
              subcategory: newSubcategory,
            });
          } else {
            throw new Error(POST_SUBCATEGORY_ERROR);
          }
        } else {
          res.status(500).json({
            message: POST_SUBCATEGORY_TITLE_ERROR,
            subcategory: null,
          });
        }
      } else {
        res.status(500).json({ error: err?.message });
      }
    }
  } catch (err) {
    next(err);
  }
};

export const updateSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const { title } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
    }
    const subcategoryItem = await subcategoryExists(subcategoryId, userId);
    if (subcategoryItem.subcategory) {
      subcategoryItem.subcategory.title =
        title ?? subcategoryItem.subcategory.title;

      const updatedSubcategory = await subcategoryItem.subcategory.save();
      res.status(200).json({
        message: PUT_SUBCATEGORIES_SUCCESS,
        subcategory: updatedSubcategory,
      });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
export const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;

    const subcategoryItem = await subcategoryExists(subcategoryId, userId);

    if (subcategoryItem.subcategory) {
      await Subcategory.findByIdAndRemove(subcategoryId);
      res.status(200).json({ message: DELETE_SUBCATEGORIES_SUCCESS });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
