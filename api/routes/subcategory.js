import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { body } from "express-validator";

export const router = express.Router();

//get all subcategories
router.get("/subcategories", isAuth);

//get subcategories by categoryId
router.get("/subcategories/:categoryId", isAuth);

router.get("/subcategories/:subcategoryId", isAuth);

router.post(
  "/subcategories/:categoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth
);
router.put(
  "/subcategories/:subcategoryId",
  [body("title").trim().isLength({ min: 3 })],
  isAuth
);
router.delete("/subcategories/:subcategoryId", isAuth);
