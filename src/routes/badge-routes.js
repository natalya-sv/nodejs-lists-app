import express from "express";

import { isAuth } from "../helpers/user-helper.js";
import { body } from "express-validator";
import {
  addBadge,
  getBadge,
  getBadges,
  getUserBadges,
  unlockBadge,
} from "../../api/controllers/badge-controller.js";

export const router = express.Router();

router.get("/badges", isAuth, getBadges);
router.get("/badges/:badgeId", isAuth, getBadge);
router.post(
  "/badges",
  [
    body("name").trim().isLength({ min: 3 }),
    body("description").trim().isLength({ min: 3 }),
    body("icon").trim().isLength({ min: 3 }),
  ],
  isAuth,
  addBadge,
);
router.post("/unlock-badge", isAuth, unlockBadge);
router.get("/user-badges/:userId", isAuth, getUserBadges);
