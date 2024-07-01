import { Schema, model, Types } from "mongoose";
interface ICategory {
  title: string;
  userId: Types.ObjectId;
  icon: string;
}
const categorySchema = new Schema<ICategory>(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);
