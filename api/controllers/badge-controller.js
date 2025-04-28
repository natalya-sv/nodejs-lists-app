import { validationResult } from "express-validator";
import { badgeExists } from "../../src/helpers/badge-helper.js";
import { Badge } from "../../src/models/badge.js";
import { setError } from "../../src/utils.js";
import { UserBadge } from "../../src/models/userBadge.js";
import {
  BADGES_NOT_FOUND,
  GET_BADGE_SUCCESS,
  GET_BADGES_SUCCESS,
  GET_USER_BADGES_SUCCESS,
  POST_BADGES_SUCCESS,
  PUT_BADGES_SUCCESS,
} from "../../constants.js";

export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();

    if (badges) {
      res.status(200).json({
        message: GET_BADGES_SUCCESS,
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
export const getUserGainedBadges = async (req, res) => {
  try {
    const userId = req?.userId;
    const badges = await UserBadge.find({ userId: userId });
    if (badges) {
      res.status(200).json({
        message: GET_USER_BADGES_SUCCESS,
        badges: badges,
        error: false,
      });
    } else {
      throw new Error("Error fetching user badges");
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
        message: GET_BADGE_SUCCESS,
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
    const { name, icon, description, criteria, badgeType } = req.body;
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
        badgeType: badgeType,
      });
      const result = await newBadge.save();
      if (result) {
        badge = newBadge;
        res.status(201).json({
          message: POST_BADGES_SUCCESS,
          badge: newBadge,
          error: false,
        });
      } else {
        throw new Error("");
      }
    } else {
      throw new Error("Badge already exists");
    }
  } catch (err) {
    res.status(500).json({
      message: err?.message,
      badge: badge,
      error: true,
    });
  }
};
export const updateBadge = async (req, res) => {
  let badge = null;
  try {
    const { name, icon, description, criteria, badgeType } = req.body;
    // const errors = validationResult(req);
    // setError(errors);
    const badgeId = req.params.badgeId;

    const badgeItem = await Badge.findById(badgeId);
    if (badgeItem) {
      badgeItem.name = name ?? badgeItem.name;
      badgeItem.criteria = criteria ?? badgeItem.criteria;
      badgeItem.icon = icon ?? badgeItem.icon;
      // badgeItem.badgeType = badgeType ?? badgeItem.badgeType;
      badgeItem.description = description ?? badgeItem.description;
      badge = badgeItem;

      const updatedBadge = await badgeItem.save();
      res.status(200).json({
        message: PUT_BADGES_SUCCESS,
        badge: updatedBadge,
        error: false,
      });
    } else {
      throw new Error(badgeItem);
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      badge: badge,
      error: true,
    });
  }
};
export const unlockBadge = async (userId, badgeId) => {
  try {
    const badge = await Badge.findById(badgeId);

    if (!badge) {
      throw new Error(BADGES_NOT_FOUND);
    }

    // Check if the user already has the badge
    const existingBadge = await UserBadge.findOne({
      userId,
      badgeId: badge._id,
    });

    if (existingBadge) {
      console.log("User already has this badge");
      return null;
    }

    const newBadge = new UserBadge({ userId, badgeId: badge._id });
    console.log("User badge saved", badge.name);
    await newBadge.save();
  } catch (error) {
    console.error("Error unlocking badge:", error);
  }
};
