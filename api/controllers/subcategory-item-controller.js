import {
  GET_SUBCATEGORY_ITEMS_SUCCESS,
  POST_SUBCATEGORY_ITEM_SUCCESS,
  POST_SUBCATEGORY_ITEM_ERROR,
  USER_NOT_FOUND,
  SUBCATEGORY_ITEM_NOT_FOUND,
  PUT_SUBCATEGORY_ITEM_SUCCESS,
  DELETE_SUBCATEGORY_ITEM_SUCCESS,
  POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR,
  POST_SUBCATEGORY_ITEM_TITLE_ERROR,
  USER_NOT_AUTH,
  SOMETHING_WENT_WRONG,
  SUBCATEGORIES_ITEMS_LIMIT_ERROR,
} from "../../constants.js";
import { SubcategoryItem } from "../../src/models/subcategoryItem.js";
import { validationResult } from "express-validator";
import { Subcategory } from "../../src/models/subcategory.js";
import {
  subcategoryItemExists,
  createSubcategoryItems,
  updateSubcategoryItems,
  countSubcategoryItems,
} from "../../src/helpers/subcategory-item-helper.js";
import { setError } from "../../src/utils.js";

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
        error: false,
      });
    } else {
      throw new Error(USER_NOT_FOUND);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategoryItems: [],
      error: true,
    });
  }
};

export const getAllSubcategoryItems = async (req, res) => {
  try {
    const userId = req.userId;

    const items = await SubcategoryItem.find({
      userId: userId,
    });
    if (items) {
      res.status(200).json({
        message: GET_SUBCATEGORY_ITEMS_SUCCESS,
        subcategoryItems: items,
        error: false,
      });
    } else {
      throw new Error(SOMETHING_WENT_WRONG);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      subcategoryItems: [],
      error: true,
    });
  }
};
export const addSubcategoryItem = async (req, res) => {
  let subcategoryItem = null;
  try {
    const { title, description, isDone } = req.body;
    const errors = validationResult(req);
    setError(errors);
    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;

    const count = await countSubcategoryItems(userId);
    if (count.error) {
      throw new Error(count.message);
    }
    if (subcategoryId) {
      const hasSubCategory = await Subcategory.findById(subcategoryId);

      if (hasSubCategory && hasSubCategory.userId.toString() === userId) {
        const subcategoryItemExists = await SubcategoryItem.findOne({
          title,
          userId,
          subcategoryId,
        });

        if (!subcategoryItemExists) {
          const newSubcategoryItem = new SubcategoryItem({
            title: title,
            description: description ?? "",
            subcategoryId: subcategoryId,
            userId: userId,
            isDone: isDone ?? false,
          });
          subcategoryItem = newSubcategoryItem;
          const result = await newSubcategoryItem.save();
          if (result) {
            res.status(201).json({
              message: POST_SUBCATEGORY_ITEM_SUCCESS,
              subcategoryItem: newSubcategoryItem,
              error: false,
            });
          } else {
            throw new Error(POST_SUBCATEGORY_ITEM_ERROR);
          }
        } else {
          throw new Error(POST_SUBCATEGORY_ITEM_TITLE_ERROR);
        }
      } else {
        throw new Error(POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR);
      }
    } else {
      throw new Error(POST_SUBCATEGORY_ITEM_ERROR);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      subcategoryItem: subcategoryItem,
      error: true,
    });
  }
};

export const addSubcategoryItemMany = async (req, res) => {
  try {
    const errors = validationResult(req);
    setError(errors);

    const userId = req.userId;
    const subcategoryId = req.params.subcategoryId;
    const itemsArray = req.body;

    const count = await countSubcategoryItems(userId);
    if (count.error) {
      throw new Error(count.message);
    }
    if (!subcategoryId) throw new Error(POST_SUBCATEGORY_ITEM_ERROR);

    const hasSubCategory = await Subcategory.findById(subcategoryId);

    if (!hasSubCategory) {
      throw new Error(POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR);
    }

    const isCurrentUser = hasSubCategory.userId.toString() === userId;

    if (!isCurrentUser) {
      throw new Error(USER_NOT_AUTH);
    }

    const addingItemsResult = {
      success: [],
      failed: [],
    };

    await createSubcategoryItems(itemsArray, userId, addingItemsResult);

    if (addingItemsResult.success.length === itemsArray.length) {
      res.status(201).json({
        message: POST_SUBCATEGORY_ITEM_SUCCESS,
        subcategoryItems: addingItemsResult.success,
        error: false,
      });
    } else {
      res.status(500).json({
        message: "Some items were not added",
        subcategoryItems: addingItemsResult.success,
        subcategoryItemsFailed: addingItemsResult.failed,
        error: true,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      subcategoryItems: [],
      error: true,
    });
  }
};

export const updateSubcategoryItem = async (req, res) => {
  let subcategoryItemR = null;
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const { title, description, isDone } = req.body;
    const errors = validationResult(req);
    setError(errors);
    const userId = req.userId;

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

        subcategoryItemR = subcategoryItem.subcategoryItem;
        const updatedSubcategoryItem =
          await subcategoryItem.subcategoryItem.save();
        res.status(200).json({
          message: PUT_SUBCATEGORY_ITEM_SUCCESS,
          subcategoryItem: updatedSubcategoryItem,
          error: false,
        });
      } else {
        throw new Error(subcategoryItem.error);
      }
    } else {
      throw new Error(SUBCATEGORY_ITEM_NOT_FOUND);
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      subcategoryItem: subcategoryItemR,
      error: true,
    });
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

    if (!hasSubCategory) {
      throw new Error(POST_SUBCATEGORY_ITEM_NOT_FOUND_ERROR);
    }

    const isCurrentUser = hasSubCategory.userId.toString() === userId;

    if (!isCurrentUser) {
      throw new Error(USER_NOT_AUTH);
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
        error: false,
      });
    } else {
      res.status(500).json({
        message: "Some items were not updated",
        subcategoryItems: addingItemsResult.success,
        subcategoryItemsFailed: addingItemsResult.failed,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      subcategoryItems: [],
      error: true,
    });
  }
};

export const deleteSubcategoryItem = async (req, res) => {
  let subcategoryItemR = null;
  try {
    const subcategoryItemId = req.params.subcategoryItemId;
    const userId = req.userId;
    const subcategoryItem = await subcategoryItemExists(
      subcategoryItemId,
      userId,
    );

    if (subcategoryItem.subcategoryItem) {
      subcategoryItemR = subcategoryItem.subcategoryItem;
      await SubcategoryItem.findByIdAndRemove(subcategoryItemId);
      res.status(200).json({
        message: DELETE_SUBCATEGORY_ITEM_SUCCESS,
        subcategoryItem: subcategoryItemR,
        error: false,
      });
    } else {
      throw new Error(subcategoryItem.error);
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      subcategoryItem: subcategoryItemR,
      error: true,
    });
  }
};
