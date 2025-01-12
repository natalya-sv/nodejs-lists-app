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
  isDone: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  index: {
    type: Number,
    required: true,
  },
});

export const SubcategoryItem = model("SubcategoryItem", subcategoryItemSchema);
