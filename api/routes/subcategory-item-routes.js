import express from "express";
import { isAuth } from "../../helpers/user-helper.js";
import { body } from "express-validator";
import {
  addSubcategoryItem,
  deleteSubcategoryItem,
  getAllSubcategoryItems,
  getSubcategoryItemsBySubcategoryId,
  updateSubcategoryItem,
  addSubcategoryItemMany,
  updateSubcategoryItemMany,
} from "../controllers/subcategory-item.js";

export const router = express.Router();

router.get(
  "/subcategory-items/subcategory/:subcategoryId",
  isAuth,
  getSubcategoryItemsBySubcategoryId,
);
router.get("/all-subcategory-items", isAuth, getAllSubcategoryItems);

router.post(
  "/subcategory-items/:subcategoryId",
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
  ],
  isAuth,
  addSubcategoryItem,
);

router.post(
  "/subcategory-items/all-subcategory-items/:subcategoryId",
  [
    body("*.title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
  ],
  isAuth,
  addSubcategoryItemMany,
);

router.put(
  "/subcategory-items/:subcategoryItemId",
  isAuth,
  updateSubcategoryItem,
);

router.put(
  "/subcategory-items/all-subcategory-items/:subcategoryId",
  [
    body("*.title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
  ],
  isAuth,
  updateSubcategoryItemMany,
);

router.delete(
  "/subcategory-items/:subcategoryItemId",
  isAuth,
  deleteSubcategoryItem,
);
