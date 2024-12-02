import express from "express";
import { isAuth } from "../helpers/user-helper.js";
import { body } from "express-validator";
import { seedDatabase } from "../../api/controllers/seed-database.js";
export const router = express.Router();
router.post("/seed-database", seedDatabase);
