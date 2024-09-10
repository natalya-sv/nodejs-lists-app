import { Schema, model } from "mongoose";
const subCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Subcategory = model("Subcategory", subCategorySchema);
