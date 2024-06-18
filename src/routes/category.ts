import express from "express";
import { getCategories } from "../controllers/category";
export const router = express.Router();

router.get("/categories", getCategories);
