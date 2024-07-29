import express from "express";
import { isAuth } from "../../utils.js";
import { body } from "express-validator";
import {
  addSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
} from "../controllers/subcategory.js";

export const router = express.Router();

//get subcategories by categoryId (category id is in the request body)
router.get("/subcategories", isAuth, getSubcategories);

router.get("/all-subcategories", isAuth, getAllSubcategories);

//get subcategory by id
router.get("/subcategories/:subcategoryId", isAuth, getSubcategory);

//add new subcategory to the corresponding category
router.post(
  "/subcategories/:categoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth,
  addSubcategory
);
router.put(
  "/subcategories/:subcategoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth,
  updateSubcategory
);
router.delete("/subcategories/:subcategoryId", isAuth, deleteSubcategory);
