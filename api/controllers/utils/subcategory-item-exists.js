import { SubcategoryItem } from "../../models/subcategoryItem.js";
import { SUBCATEGORY_ITEM_NOT_FOUND, NOT_AUTHORIZED } from "../../../constants.js";

export const subcategoryItemExists = async (subcategoryItemId, userId) => {
  const subcategoryItem = await SubcategoryItem.findById(subcategoryItemId);
  
  const subcategoryItemObj = { subcategoryItem: null, error: null };
  if (!subcategoryItem) {
    subcategoryItemObj.error = SUBCATEGORY_ITEM_NOT_FOUND;
    return subcategoryItemObj;
  }
  if (subcategoryItem.userId.toString() !== userId) {
    subcategoryItemObj.error = NOT_AUTHORIZED;
    return subcategoryItemObj;
  }
  subcategoryItemObj.subcategoryItem = subcategoryItem;

  return subcategoryItemObj;
};
