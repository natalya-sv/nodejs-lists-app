import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  getTestData,
  getCategory,
} from "../controllers/category.js";
import { isAuth } from "../middleware/isAuth.js";
import { body } from "express-validator";

export const router = express.Router();

router.get("/categories", isAuth, getCategories);
router.get("/categories/:categoryId", isAuth, getCategory);
router.post(
  "/categories",
  [
    body("title").trim().isLength({ min: 3 }),
    body("icon").trim().isLength({ min: 3 }),
  ],
  isAuth,
  addCategory
);
router.put(
  "/categories/:categoryId",
  [
    body("title").trim().isLength({ min: 3 }),
    body("icon").trim().isLength({ min: 3 }),
  ],
  isAuth,
  updateCategory
);
router.delete("/categories/:categoryId", isAuth, deleteCategory);
router.get("/test", getTestData);
