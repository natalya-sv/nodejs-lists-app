import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { body } from "express-validator";
import {
  addSubcategoryItem,
  deleteSubcategoryItem,
  getSubcategoryItemsBySubcategoryId,
  updateSubcategoryItem,
} from "../controllers/subcategory-item.js";

export const router = express.Router();

router.get("/subcategory-items", isAuth, getSubcategoryItemsBySubcategoryId);

router.post(
  "/subcategory-items/:subcategoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth,
  addSubcategoryItem
);
router.put(
  "/subcategory-items/:subcategoryItemId",

  isAuth,
  updateSubcategoryItem
);
router.delete(
  "/subcategory-items/:subcategoryItemId",
  isAuth,
  deleteSubcategoryItem
);
