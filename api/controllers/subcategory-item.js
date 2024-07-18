import {
  GET_SUBCATEGORY_ITEMS_SUCCESS,
  POST_SUBCATEGORY_ITEM_SUCCESS,
  POST_SUBCATEGORY_ITEM_ERROR,
  USER_NOT_FOUND,
  SUBCATEGORY_ITEM_NOT_FOUND,
  NOT_AUTHORIZED,
  PUT_SUBCATEGORY_ITEM_SUCCESS,
  DELETE_SUBCATEGORY_ITEM_SUCCESS,
  ENTER_VALID_INPUT,
} from "../../constants.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";
import { validationResult } from "express-validator";
import { generateFieldValidationErrorMessage } from "../../utils.js";

export const getSubcategoryItemsBySubcategoryId = async (req, res, next) => {
  try {
    const { subcategoryId } = req?.body;
    const userId = req.userId;
    if (subcategoryId && userId) {
      const items = await SubcategoryItem.find({
        subcategoryId: subcategoryId,
        userId: userId,
      });

      res.status(200).json({
        message: GET_SUBCATEGORY_ITEMS_SUCCESS,
        subcategoryItems: items,
      });
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
};

export const addSubcategoryItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw error;
    }
    if (subcategoryId) {
      const newSubcategoryItem = new SubcategoryItem({
        title: title,
        description: description ?? "",
        subcategoryId: subcategoryId,
        userId: userId,
      });
      const result = await newSubcategoryItem.save();
      if (result) {
        res.status(201).json({
          message: POST_SUBCATEGORY_ITEM_SUCCESS,
          subcategoryItem: newSubcategoryItem,
        });
      }
    } else {
      throw new Error(POST_SUBCATEGORY_ITEM_ERROR);
    }
  } catch (err) {
    next(err);
  }
};

export const updateSubcategoryItem = async (req, res, next) => {
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const { title, description } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw error;
    }
    if (subcategoryItemId) {
      const subcategoryItem = await SubcategoryItem.findById(subcategoryItemId);
      if (!subcategoryItem) {
        const error = new Error(SUBCATEGORY_ITEM_NOT_FOUND);
        throw error;
      }

      if (subcategoryItem.userId.toString() !== userId) {
        const error = new Error(NOT_AUTHORIZED);
        throw error;
      }
      subcategoryItem.title = title ?? subcategoryItem.title;
      subcategoryItem.description = description ?? subcategoryItem.description;

      const updatedSubcategoryItem = await subcategoryItem.save();
      res.status(200).json({
        message: PUT_SUBCATEGORY_ITEM_SUCCESS,
        subcategoryItem: updatedSubcategoryItem,
      });
    } else {
      throw new Error(SUBCATEGORY_ITEM_NOT_FOUND);
    }
  } catch (err) {
    next(err);
  }
};
export const deleteSubcategoryItem = async (req, res, next) => {
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const userId = req.userId;
    const subcategoryItem = await SubcategoryItem.findById(subcategoryItemId);
    if (!subcategoryItem) {
      const error = new Error(SUBCATEGORY_ITEM_NOT_FOUND);
      throw error;
    }

    if (subcategoryItem.userId.toString() !== userId) {
      const error = new Error(NOT_AUTHORIZED);
      throw error;
    }
    await SubcategoryItem.findByIdAndRemove(subcategoryItemId);
    res.status(200).json({ message: DELETE_SUBCATEGORY_ITEM_SUCCESS });
  } catch (err) {
    next(err);
  }
};
