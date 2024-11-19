import { Subcategory } from "../../src/models/subcategory.js";
import { validationResult } from "express-validator";
import { setError } from "../../src/utils.js";
import {
  ARCHIVE_SUBCATEGORIES_SUCCESS,
  DELETE_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORY_SUCCESS,
  POST_SUBCATEGORIES_SUCCESS,
  POST_SUBCATEGORY_ERROR,
  POST_SUBCATEGORY_TITLE_ERROR,
  PUT_SUBCATEGORIES_SUCCESS,
  SUBCATEGORIES_NOT_FOUND,
  USER_NOT_FOUND,
} from "../../constants.js";
import { Category } from "../../src/models/category.js";
import {
  countSubcategories,
  subcategoryExists,
} from "../../src/helpers/subcategory-helper.js";

export const getSubcategory = async (req, res) => {
  let subcategory = null;
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;
    if (subcategoryId) {
      const subcategoryItem = await subcategoryExists(subcategoryId, userId);

      if (subcategoryItem.subcategory) {
        subcategory = subcategoryItem.subcategory;
        res.status(200).json({
          message: GET_SUBCATEGORY_SUCCESS,
          subcategory: subcategoryItem.subcategory,
          error: false,
        });
      } else {
        throw new Error(subcategoryItem.error);
      }
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategory: subcategory,
      error: true,
    });
  }
};
export const getAllSubcategories = async (req, res) => {
  try {
    const { archived } = req.body;

    const userId = req.userId;
    const subcategories = await Subcategory.find({
      userId: userId,
      archived: archived ?? false,
    });

    res.status(200).json({
      message: GET_SUBCATEGORIES_SUCCESS,
      subcategories: subcategories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategories: [],
      error: true,
    });
  }
};
export const getSubcategories = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req.userId;
    const { archived } = req.body;

    if (categoryId) {
      const subcategories = await Subcategory.find({
        categoryId: categoryId,
        userId: userId,
        archived: archived ?? false,
      });

      res.status(200).json({
        message: GET_SUBCATEGORIES_SUCCESS,
        subcategories: subcategories,
        error: false,
      });
    } else {
      throw new Error(SUBCATEGORIES_NOT_FOUND);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategories: [],
      error: true,
    });
  }
};
export const addSubcategory = async (req, res) => {
  let subcategory = null;
  try {
    const { title } = req.body;
    const errors = validationResult(req);
    setError(errors);
    const userId = req.userId;
    const categoryId = req.params.categoryId;

    const count = await countSubcategories(userId);
    if (count.error) {
      throw new Error(count.message);
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
          subcategory = newSubcategory;
          const result = await newSubcategory.save();
          if (result) {
            res.status(201).json({
              message: POST_SUBCATEGORIES_SUCCESS,
              subcategory: newSubcategory,
              error: false,
            });
          } else {
            throw new Error(POST_SUBCATEGORY_ERROR);
          }
        } else {
          throw new Error(POST_SUBCATEGORY_TITLE_ERROR);
        }
      } else {
        throw new Error(POST_SUBCATEGORY_ERROR);
      }
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      subcategory: subcategory,
      error: true,
    });
  }
};

export const updateSubcategory = async (req, res) => {
  let subcategory = null;

  try {
    const subcategoryId = req.params.subcategoryId;
    const { title } = req.body;
    const errors = validationResult(req);
    setError(errors);
    const userId = req.userId;

    const subcategoryItem = await subcategoryExists(subcategoryId, userId);
    if (subcategoryItem.subcategory) {
      subcategoryItem.subcategory.title =
        title ?? subcategoryItem.subcategory.title;
      subcategory = subcategoryItem.subcategory;
      const updatedSubcategory = await subcategoryItem.subcategory.save();
      res.status(200).json({
        message: PUT_SUBCATEGORIES_SUCCESS,
        subcategory: updatedSubcategory,
        error: false,
      });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      subcategory: subcategory,
      error: true,
    });
  }
};
export const deleteSubcategory = async (req, res) => {
  let subcategory = null;
  try {
    const subcategoryId = req.params.subcategoryId;
    const userId = req.userId;

    const subcategoryItem = await subcategoryExists(subcategoryId, userId);

    if (subcategoryItem.subcategory) {
      subcategory = subcategoryItem.subcategory;
      await Subcategory.findByIdAndRemove(subcategoryId);
      res.status(200).json({
        message: DELETE_SUBCATEGORIES_SUCCESS,
        subcategory: subcategory,
        error: false,
      });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      subcategory: subcategory,
      error: true,
    });
  }
};
export const archiveSubcategories = async (req, res) => {
  try {
    const { subcategoriesIds } = req.body;

    for (let i = 0; i < subcategoriesIds.length; i++) {
      const subcategoryId = subcategoriesIds[i];
      const subcategory = await Subcategory.findByIdAndUpdate(subcategoryId, {
        archived: true,
      });

      if (!subcategory) {
        throw new Error("Error archiving subcategory with", subcategory);
      }
    }
    res.status(200).json({
      message: ARCHIVE_SUBCATEGORIES_SUCCESS,
      subcategories: subcategoriesIds,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategories: [],
      error: true,
    });
  }
};
