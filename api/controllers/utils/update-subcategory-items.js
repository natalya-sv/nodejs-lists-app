import { subcategoryItemExists } from "./subcategory-item-exists.js";

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
