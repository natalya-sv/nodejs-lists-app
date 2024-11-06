import {
  SUBCATEGORY_ITEM_NOT_FOUND,
  NOT_AUTHORIZED,
  SUBCATEGORIES_ITEMS_LIMIT_ERROR,
} from "../../constants.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";

async function createSubcategoryItem(item, userId) {
  const newSubcategoryItem = new SubcategoryItem({
    title: item.title,
    description: item.description ?? "",
    subcategoryId: item.subcategoryId,
    userId: userId,
    isDone: item.isDone ?? false,
  });

  const result = await newSubcategoryItem.save();

  if (result) return { title: item.title };

  return {
    title: item.title,
    message: "error saving item",
  };
}

export async function createSubcategoryItems(
  itemsArray,
  userId,
  addingItemsResult,
) {
  await Promise.all(
    itemsArray.map(async (item) => {
      const subcategoryItemExists = await SubcategoryItem.findOne({
        title: item.title,
        userId,
        subcategoryId: item.subcategoryId,
      });

      if (!subcategoryItemExists) {
        const result = await createSubcategoryItem(item, userId);
        const isError = !!result.message;
        isError
          ? addingItemsResult.failed.push(result)
          : addingItemsResult.success.push(result);
      } else {
        addingItemsResult.failed.push({
          title: item.title,
          message: "item already exists",
        });
      }
    }),
  );
}

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

export async function updateSubcategoryItems(
  itemsArray,
  userId,
  addingItemsResult,
) {
  await Promise.all(
    itemsArray.map(async (item) => {
      const subcategoryItemId = item._id;
      const subcategoryItem = await subcategoryItemExists(
        subcategoryItemId,
        userId,
      );

      if (subcategoryItem.subcategoryItem) {
        subcategoryItem.subcategoryItem.title =
          item.title ?? subcategoryItem.subcategoryItem.title;
        subcategoryItem.subcategoryItem.description =
          item.description ?? subcategoryItem.subcategoryItem.description;
        subcategoryItem.subcategoryItem.isDone =
          item.isDone ?? subcategoryItem.subcategoryItem.isDone;

        const updatedSubcategoryItem =
          await subcategoryItem.subcategoryItem.save();
        addingItemsResult.success.push(updatedSubcategoryItem);
      } else {
        addingItemsResult.failed.push({
          title: item.title,
          message: subcategoryItem.error,
        });
      }
    }),
  );
}
export const countSubcategoryItems = async (userId) => {
  const numberOfSubCategories = await SubcategoryItem.count({
    userId: userId,
  });
  if (numberOfSubCategories >= 50) {
    return { error: true, message: SUBCATEGORIES_ITEMS_LIMIT_ERROR };
  } else {
    return { error: false, message: "" };
  }
};
