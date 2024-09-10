import { Category } from "../models/category.js";
import { CATEGORY_NOT_FOUND, NOT_AUTHORIZED } from "../../constants.js";

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
