import { validationResult } from "express-validator";
import { badgeExists } from "../../src/helpers/badge-helper";
import { Badge } from "../../src/models/badge";
import { setError } from "../../src/utils.js";
import { UserBadge } from "../models/UserBadge";

export const getBadges = async (req, res) => {
  try {
    const userId = req?.userId;
    const badges = await Badge.find({ userId: userId });

    if (badges) {
      res.status(200).json({
        message: "",
        badges: badges,
        error: false,
      });
    } else {
      throw new Error("");
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      badges: [],
      error: true,
    });
  }
};
export const getBadge = async (req, res) => {
  try {
    const badgeId = req.params.categoryId;
    const userId = req?.userId;

    const badgeItem = await badgeExists(badgeId, userId);

    if (badgeItem.category) {
      res.status(200).json({
        message: "",
        badges: badgeItem.badge,
        error: false,
      });
    } else {
      throw new Error(badgeItem.error);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      badge: null,
      error: true,
    });
  }
};
export const addBadge = async (req, res) => {
  let badge = null;
  try {
    const { name, icon, description, criteria } = req.body;
    const errors = validationResult(req);

    setError(errors);

    const badgeExists = await Badge.findOne({
      name: name,
    });
    if (!badgeExists) {
      const newBadge = new Badge({
        name: name,
        description: description,
        icon: icon,
        criteria: criteria,
      });
      const result = await newBadge.save();
      if (result) {
        badge = newBadge;
        res.status(201).json({
          message: "",
          badge: newBadge,
          error: false,
        });
      } else {
        throw new Error("");
      }
    } else {
      throw new Error("");
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      badge: badge,
      error: true,
    });
  }
};

export const unlockBadge = async (userId, badgeName) => {
  try {
    const badge = await Badge.findOne({ name: badgeName });

    if (!badge) {
      throw new Error("Badge not found");
    }

    // Check if the user already has the badge
    const existingBadge = await UserBadge.findOne({
      userId,
      badgeId: badge._id,
    });

    if (existingBadge) {
      console.log("User already has this badge");
      return;
    }

    const newBadge = new UserBadge({ userId, badgeId: badge._id });
    await newBadge.save();
  } catch (error) {
    console.error("Error unlocking badge:", error);
  }
};
export const getUserBadges = async (req, res) => {
  const { userId } = req.params;

  try {
    const userBadges = await UserBadge.find({ userId }).populate("badgeId");
    res.status(200).json({ userBadges: userBadges, error: false, message: "" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user badges" + error,
      userBadges: [],
      error: true,
    });
  }
};
