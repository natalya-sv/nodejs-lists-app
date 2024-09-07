import { SubcategoryItem } from "../../models/subcategoryItem.js";

export async function createSubcategoryItem(item, userId, subcategoryId) {
  const newSubcategoryItem = new SubcategoryItem({
    title: item.title,
    description: item.description ?? "",
    subcategoryId: subcategoryId,
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
