import { createSubcategoryItem } from "./create-subcategory-item.js";
import { SubcategoryItem } from "../../models/subcategoryItem.js";

export async function createSubcategoryItems(
  itemsArray,
  userId,
  addingItemsResult,
) {
  await Promise.all(
    itemsArray.map(async (item) => {
      const subcategoryItemExists = await SubcategoryItem.findOne({
        // TODO it checks through all items, but should check only through the current list
        title: item.title,
        userId,
      });

      if (!subcategoryItemExists) {
        const result = await createSubcategoryItem(item);
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
