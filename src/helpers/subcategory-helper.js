import { Subcategory } from "../models/subcategory.js";
import { NOT_AUTHORIZED, SUBCATEGORIES_NOT_FOUND } from "../../constants.js";

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
