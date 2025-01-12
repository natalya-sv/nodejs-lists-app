import { Category } from "../models/category.js";
import {
  CATEGORIES_LIMIT_ERROR,
  CATEGORY_NOT_FOUND,
  NOT_AUTHORIZED,
} from "../../constants.js";

export const categoryExists = async (categoryId, userId) => {
  const category = await Category.findById(categoryId);
  const categoryItem = { category: null, error: null };
  if (!category) {
    categoryItem.error = CATEGORY_NOT_FOUND;
    return categoryItem;
  }
  if (category.userId.toString() !== userId) {
    categoryItem.error = NOT_AUTHORIZED;
    return categoryItem;
  }
  categoryItem.category = category;

  return categoryItem;
};
export const countCategories = async (userId) => {
  const numberOfCategories = await Category.count({ userId: userId });

  if (numberOfCategories >= 30) {
    return { error: true, message: CATEGORIES_LIMIT_ERROR };
  }

  return { error: false, message: "" };
};
