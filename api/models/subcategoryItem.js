import { Schema, model } from "mongoose";

const subcategoryItemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  subcategoryId: {
    type: Schema.Types.ObjectId,
    ref: "Subcategory",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const SubcategoryItem = model("SubcategoryItem", subcategoryItemSchema);
