import { Subcategory } from "../models/subcategory.js";
import {
  NOT_AUTHORIZED,
  SUBATEGORIES_LIMIT_ERROR,
  SUBCATEGORIES_NOT_FOUND,
} from "../../constants.js";

export const subcategoryExists = async (subcategoryId, userId) => {
  const subcategory = await Subcategory.findById(subcategoryId);
  const subcategoryItem = { subcategory: null, error: null };

  if (!subcategory) {
    subcategoryItem.error = SUBCATEGORIES_NOT_FOUND;
    return subcategoryItem;
  }

  if (subcategory.userId.toString() !== userId) {
    subcategoryItem.error = NOT_AUTHORIZED;
    return subcategoryItem;
  }
  subcategoryItem.subcategory = subcategory;
  return subcategoryItem;
};
export const countSubcategories = async (userId) => {
  const numberOfSubCategories = await Subcategory.count({ userId: userId });
  if (numberOfSubCategories >= 30) {
    return { error: true, message: SUBATEGORIES_LIMIT_ERROR };
  }
  return { error: false, message: "" };
};
