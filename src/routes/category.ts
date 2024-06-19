import express from "express";
import { addCategory, getCategories } from "../controllers/category";
import { isAuth } from "../middleware/isAuth";
export const router = express.Router();

router.get("/categories", isAuth, getCategories);
router.post("/categories", isAuth, addCategory);
