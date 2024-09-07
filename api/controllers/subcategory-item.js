import {
  GET_SUBCATEGORY_ITEMS_SUCCESS,
  POST_SUBCATEGORY_ITEM_SUCCESS,
  POST_SUBCATEGORY_ITEM_ERROR,
  USER_NOT_FOUND,
  SUBCATEGORY_ITEM_NOT_FOUND,
  PUT_SUBCATEGORY_ITEM_SUCCESS,
  DELETE_SUBCATEGORY_ITEM_SUCCESS,
  ENTER_VALID_INPUT,
  POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR,
  POST_SUBCATEGORY_ITEM_TITLE_ERROR,
} from "../../constants.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";
import { validationResult } from "express-validator";
import { generateFieldValidationErrorMessage } from "../../utils.js";
import { Subcategory } from "../models/subcategory.js";
import { setError } from "./utils/set-error.js";
import { createSubcategoryItems } from "./utils/create-subcategory-items.js";
import { subcategoryItemExists } from "./utils/subcategory-item-exists.js";
import { updateSubcategoryItems } from "./utils/update-subcategory-items.js";

export const getSubcategoryItemsBySubcategoryId = async (req, res) => {
  try {
    const subcategoryId = req.params.subcategoryId;
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
    res.status(500).json({ error: error?.message });
  }
};

export const getAllSubcategoryItems = async (req, res) => {
  try {
    const userId = req.userId;

    const items = await SubcategoryItem.find({
      userId: userId,
    });

    res.status(200).json({
      message: GET_SUBCATEGORY_ITEMS_SUCCESS,
      subcategoryItems: items,
    });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
};
export const addSubcategoryItem = async (req, res) => {
  try {
    const { title, description, isDone } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
    }
    if (subcategoryId) {
      const hasSubCategory = await Subcategory.findById(subcategoryId);
      if (hasSubCategory && hasSubCategory.userId.toString() === userId) {
        const subcategoryItemExists = await SubcategoryItem.findOne({
          title: title,
          userId: userId,
        });
        if (!subcategoryItemExists) {
          const newSubcategoryItem = new SubcategoryItem({
            title: title,
            description: description ?? "",
            subcategoryId: subcategoryId,
            userId: userId,
            isDone: isDone ?? false,
          });
          const result = await newSubcategoryItem.save();
          if (result) {
            res.status(201).json({
              message: POST_SUBCATEGORY_ITEM_SUCCESS,
              subcategoryItem: newSubcategoryItem,
            });
          } else {
            throw new Error(POST_SUBCATEGORY_ITEM_ERROR);
          }
        } else {
          res.status(500).json({
            message: POST_SUBCATEGORY_ITEM_TITLE_ERROR,
            subcategoryItem: null,
          });
        }
      } else {
        throw new Error(POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR);
      }
    } else {
      throw new Error(POST_SUBCATEGORY_ITEM_ERROR);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const addSubcategoryItemMany = async (req, res) => {
  try {
    const errors = validationResult(req);
    setError(errors);

    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;

    if (!subcategoryId) throw new Error(POST_SUBCATEGORY_ITEM_ERROR);

    const hasSubCategory = await Subcategory.findById(subcategoryId);

    const isCurrentUser = hasSubCategory.userId.toString() === userId;

    if (!hasSubCategory || !isCurrentUser) {
      throw new Error(POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR);
    }

    const addingItemsResult = {
      success: [],
      failed: [],
    };

    const itemsArray = req.body;

    await createSubcategoryItems(itemsArray, userId, addingItemsResult);

    if (addingItemsResult.success.length === itemsArray.length) {
      res.status(201).json({
        message: POST_SUBCATEGORY_ITEM_SUCCESS,
        subcategoryItems: addingItemsResult.success,
      });
    } else {
      res.status(500).json({
        message: "Some items were not added",
        subcategoryItems: addingItemsResult.success,
        subcategoryItemsFailed: addingItemsResult.failed,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const updateSubcategoryItem = async (req, res) => {
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const { title, description, isDone } = req.body;
    const errors = validationResult(req);
    const userId = req.userId;
    if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
    }
    
    if (subcategoryItemId) {
      const subcategoryItem = await subcategoryItemExists(
        subcategoryItemId,
        userId,
      );

      if (subcategoryItem.subcategoryItem) {
        subcategoryItem.subcategoryItem.title =
          title ?? subcategoryItem.subcategoryItem.title;
        subcategoryItem.subcategoryItem.description =
          description ?? subcategoryItem.subcategoryItem.description;
        subcategoryItem.subcategoryItem.isDone =
          isDone ?? subcategoryItem.subcategoryItem.isDone;

        const updatedSubcategoryItem =
          await subcategoryItem.subcategoryItem.save();
        res.status(200).json({
          message: PUT_SUBCATEGORY_ITEM_SUCCESS,
          subcategoryItem: updatedSubcategoryItem,
        });
      } else {
        throw new Error(subcategoryItem.error);
      }
    } else {
      throw new Error(SUBCATEGORY_ITEM_NOT_FOUND);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const updateSubcategoryItemMany = async (req, res) => {
  try {
    const errors = validationResult(req);

    setError(errors);

    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;

    if (!subcategoryId) throw new Error(POST_SUBCATEGORY_ITEM_ERROR);

    const hasSubCategory = await Subcategory.findById(subcategoryId);

    const isCurrentUser = hasSubCategory.userId.toString() === userId;

    if (!hasSubCategory || !isCurrentUser) {
      throw new Error(SUBCATEGORY_ITEM_NOT_FOUND);
    }

    const addingItemsResult = {
      success: [],
      failed: [],
    };
    const itemsArray = req.body;

    await updateSubcategoryItems(itemsArray, userId, addingItemsResult);

    if (addingItemsResult.success.length === itemsArray.length) {
      res.status(201).json({
        message: PUT_SUBCATEGORY_ITEM_SUCCESS,
        subcategoryItems: addingItemsResult.success,
      });
    } else {
      res.status(500).json({
        message: "Some items were not updated",
        subcategoryItems: addingItemsResult.success,
        subcategoryItemsFailed: addingItemsResult.failed,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const deleteSubcategoryItem = async (req, res) => {
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const userId = req.userId;
    const subcategoryItem = await subcategoryItemExists(
      subcategoryItemId,
      userId,
    );

    if (subcategoryItem.subcategoryItem) {
      await SubcategoryItem.findByIdAndRemove(subcategoryItemId);
      res.status(200).json({ message: DELETE_SUBCATEGORY_ITEM_SUCCESS });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
