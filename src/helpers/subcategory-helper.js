import { Subcategory } from "../models/subcategory.js";
import {
  NOT_AUTHORIZED,
  SUBATEGORIES_LIMIT_ERROR,
  SUBCATEGORIES_NOT_FOUND,
} from "../../constants.js";
import { Category } from "../models/category.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";

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
export const deleteSubcategoriesByCategoryId = async (categoryId, userId) => {
  try {
    const subcategories = await Subcategory.find({
      categoryId: categoryId,
      userId: userId,
    });
    const subcategoriesIds = subcategories.map(
      (subcategory) => subcategory._id,
    );
    await Subcategory.deleteMany({
      categoryId: categoryId,
      userId: userId,
    });
    await SubcategoryItem.deleteMany({
      subcategoryId: { $in: subcategoriesIds },
      userId: userId,
    });
    return { error: false, message: "items deleted" };
  } catch (err) {
    return { error: true, message: err?.message ?? err };
  }
};
