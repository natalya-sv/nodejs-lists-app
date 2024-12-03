import express from "express";
import { isAuth } from "../helpers/user-helper.js";
import { body } from "express-validator";
import {
  deleteSubcategory,
  getAllSubcategories,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  addSubcategory,
  archiveSubcategories,
} from "../../api/controllers/subcategory-controller.js";

export const router = express.Router();

//get subcategories by categoryId (category id is in the request body)
router.get("/subcategories/category/:categoryId", isAuth, getSubcategories);

router.get("/all-subcategories", isAuth, getAllSubcategories);

//get subcategory by id
router.get("/subcategories/:subcategoryId", isAuth, getSubcategory);

//add new subcategory to the corresponding category
router.post(
  "/subcategories/:categoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth,
  addSubcategory,
);
router.put("/subcategories/archive", isAuth, archiveSubcategories);
router.put(
  "/subcategories/:subcategoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth,
  updateSubcategory,
);

router.delete("/subcategories/:subcategoryId", isAuth, deleteSubcategory);
