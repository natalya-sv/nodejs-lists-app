import { Subcategory } from "../models/subcategory.js";
import { validationResult } from "express-validator";
import { generateFieldValidationErrorMessage } from "../../utils.js";
import {
  DELETE_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORY_SUCCESS,
  NOT_AUTHORIZED,
  POST_SUBCATEGORIES_SUCCESS,
  POST_SUBCATEGORY_ERROR,
  PUT_SUBCATEGORIES_SUCCESS,
  SUBCATEGORY_NOT_FOUND,
} from "../../constants.js";

export const getSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;
    if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId);
      if (!subcategory) {
        const error = new Error(SUBCATEGORY_NOT_FOUND);
        throw error;
      }

      if (subcategory.userId.toString() !== userId) {
        const error = new Error(NOT_AUTHORIZED);
        throw error;
      }
      res
        .status(200)
        .json({ message: GET_SUBCATEGORY_SUCCESS, subcategory: subcategory });
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
};
export const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req?.body;
    const userId = req.userId;
    if (categoryId && userId) {
      const subcategories = await Subcategory.find({
        categoryId: categoryId,
        userId: userId,
      });

      res.status(200).json({
        message: GET_SUBCATEGORIES_SUCCESS,
        subcategories: subcategories,
      });
    } else {
      throw new Error(SUBCATEGORY_NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
};
export const addSubcategory = async (req, res, next) => {
  try {
    const { title } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw error;
    }
    const newSubcategory = new Subcategory({
      title: title,
      categoryId: req.params.categoryId,
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
  } catch (err) {
    next(err);
  }
};

export const updateSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const { title, categoryId } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;

    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw error;
    }
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error(SUBCATEGORY_NOT_FOUND);
      throw error;
    }

    if (subcategory.userId.toString() !== userId) {
      const error = new Error(NOT_AUTHORIZED);
      throw error;
    }
    subcategory.title = title ?? subcategory.title;
    subcategory.categoryId = categoryId ?? subcategory.categoryId;

    const updatedSubcategory = await subcategory.save();
    res.status(200).json({
      message: PUT_SUBCATEGORIES_SUCCESS,
      subcategory: updatedSubcategory,
    });
  } catch (err) {
    next(err);
  }
};
export const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;

    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      const error = new Error(SUBCATEGORY_NOT_FOUND);
      throw error;
    }

    if (subcategory.userId.toString() !== userId) {
      const error = new Error(NOT_AUTHORIZED);
      throw error;
    }
    await Subcategory.findByIdAndRemove(subcategoryId);
    res.status(200).json({ message: DELETE_SUBCATEGORIES_SUCCESS });
  } catch (err) {
    next(err);
  }
};
