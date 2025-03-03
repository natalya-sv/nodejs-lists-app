import { unlockBadge } from "../../api/controllers/badge-controller.js";
import { NOT_AUTHORIZED } from "../../constants.js";
import { Badge } from "../models/badge.js";
import { Category } from "../models/category.js";
import { Subcategory } from "../models/subcategory.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";
import { UserBadge } from "../models/userBadge.js";

export const badgeExists = async (badgeId, userId) => {
  const badge = await Badge.findById(badgeId);
  const badgeItem = { badge: null, error: null };
  if (!badge) {
    badgeItem.error = "";
    return badgeItem;
  }
  if (badge.userId.toString() !== userId) {
    badgeItem.error = NOT_AUTHORIZED;
    return badgeItem;
  }
  badgeItem.badge = badge;

  return badgeItem;
};
export const checkCategoriesBadges = async (userId) => {
  try {
    //do this in the background later
    const badges = await UserBadge.find({ userId: userId });
    const userBadges = badges.map((userBadge) => userBadge.badgeId);

    const allBadges = await Badge.find({ badgeType: "category" });

    const categoryRookie = allBadges.find(
      (badge) => badge.name === "Category Rookie",
    );
    const categoryProfie = allBadges.find(
      (badge) => badge.name === "Category Proffie",
    );

    console.log("starting category badges check");
    // Start checking if a user already has a badge
    if (categoryRookie?._id && !userBadges.includes(categoryRookie._id)) {
      const userCategories = await Category.countDocuments({
        userId: userId,
      });
      console.log("result categoryMaker:", userCategories);

      if (userCategories >= 3) {
        console.log("You got the Category Maker badge");
        // Category Rookie – Created your first 3 categories
        await unlockBadge(userId, categoryRookie._id);
      }
    }
    if (categoryProfie?._id && !userBadges.includes(categoryProfie._id)) {
      const userCategories = await Category.countDocuments({
        userId: userId,
      });
      console.log("result categoryProfie", userCategories);

      if (userCategories >= 3) {
        console.log("You got the Category Profie badge");
        // Category Profie – Created 50 categories
        await unlockBadge(userId, categoryProfie._id);
      }
    }

    console.log("finished category badges check");
  } catch (err) {
    console.log("err", err);
  }
};

export const checkSubCategoriesBadges = async (userId) => {
  try {
    //do this in the background
    const badges = await UserBadge.find({ userId: userId });
    const userBadges = badges.map((userBadge) => userBadge.badgeId);

    const allBadges = await Badge.find({ badgeType: "subcategory" });

    const listMaker = allBadges.find((badge) => badge.name === "List Maker");
    const zeroInbox = allBadges.find((badge) => badge.name === "Zero Inbox");

    console.log("starting subcategory badges check");
    // Start checking if a user  already has  a badge
    if (zeroInbox?._id && !userBadges.includes(zeroInbox._id)) {
      const subcategories = await Subcategory.find({
        userId: userId,
        completedAt: { $ne: null },
      });
      console.log("result zeroInbox:", subcategories);
      if (subcategories.length > 0) {
        console.log("You got the Zero Inbox badge");
        // "Zero Inbox" – Complete all tasks in a list.
        await unlockBadge(userId, zeroInbox._id);
      }
    }

    if (listMaker?._id && !userBadges.includes(listMaker._id)) {
      const userSubcategories = await Subcategory.count({ userId: userId });
      console.log("result userSubcategories:", userSubcategories);
      if (userSubcategories >= 10) {
        console.log("You got the List Maker badge");
        // "List Maker" – Create 10 different lists.
        await unlockBadge(userId, listMaker._id);
      }
    }
    console.log("finished badges check");
  } catch (err) {
    console.log("err", err);
  }
};

export const checkSubcategoryItemsBadges = async (userId) => {
  try {
    //do this in the background
    const badges = await UserBadge.find({ userId: userId });
    const userBadges = badges.map((userBadge) => userBadge.badgeId);

    const allBadges = await Badge.find({ badgeType: "subcategory-item" });

    const taskRookie = allBadges.find((badge) => badge.name === "Task Rookie");
    const taskMaster = allBadges.find((badge) => badge.name === "Task Master");
    const earlyBird = allBadges.find((badge) => badge.name === "Early Bird");
    const nightOwl = allBadges.find((badge) => badge.name === "Night Owl");
    const lightningFast = allBadges.find(
      (badge) => badge.name === "Lightning Fast",
    );
    const weekendWarrior = allBadges.find(
      (badge) => badge.name === "Weekend Warrior",
    );
    const perfectWeek = allBadges.find(
      (badge) => badge.name === "Perfect Week",
    );
    const masterPlanner = allBadges.find(
      (badge) => badge.name === "Master Planner",
    );
    const unstoppable = allBadges.find((badge) => badge.name === "Unstoppable");

    console.log("starting  badges check", userId);
    // Start checking if a user  already has  a badge
    if (taskRookie?._id && !userBadges.includes(taskRookie._id)) {
      const userSubcategoriyItems = await SubcategoryItem.countDocuments({
        userId: userId,
        isDone: true,
      });
      console.log("result userSubcategoriyItems 1:", userSubcategoriyItems);

      if (userSubcategoriyItems === 1) {
        console.log("You got the Task Rookie badge");
        // "Task Rookie" – Complete your first task.
        await unlockBadge(userId, taskRookie._id);
      }
    }
    if (taskMaster?._id && !userBadges.includes(taskMaster._id)) {
      const userSubcategoriyItems = await SubcategoryItem.countDocuments({
        userId: userId,
        isDone: true,
      });
      console.log("result taskMaster 100:", userSubcategoriyItems);

      if (userSubcategoriyItems >= 100) {
        console.log("You got the Task Master badge");
        // "Task Master" – Complete 100 tasks.
        await unlockBadge(userId, taskMaster._id);
      }
    }

    if (earlyBird?._id && !userBadges.includes(earlyBird._id)) {
      const subcategoryItems = await SubcategoryItem.find({
        userId: userId,
        completedAt: { $ne: null },
      });
      const itemCompletedBefore8AM = subcategoryItems.find(
        (mitem) => new Date(mitem.completedAt).getHours() < 8,
      );
      console.log("result itemCompletedBefore8AM:", itemCompletedBefore8AM);

      if (itemCompletedBefore8AM) {
        console.log("You got the Early Bird badge");
        await unlockBadge(userId, earlyBird._id);
        // "Early Bird" – Complete a task before 8 AM.
      }
    }
    if (nightOwl?.id && !userBadges.includes(nightOwl._id)) {
      const subcategoryItems = await SubcategoryItem.find({
        userId: userId,
        completedAt: { $ne: null },
      });
      console.log("result subcategoryItems:", subcategoryItems);

      const itemCompletedAfter11PM = subcategoryItems.find(
        (mitem) => new Date(mitem.completedAt).getHours() >= 23,
      );

      if (itemCompletedAfter11PM) {
        console.log("You got the Night Owl badge");
        await unlockBadge(userId, nightOwl._id);
        // "Night Owl" – Complete a task after 11 PM.
      }
    }

    if (lightningFast?.id && !userBadges.includes(lightningFast._id)) {
      const completedWithinFiveMin = await SubcategoryItem.findOne({
        userId: userId,
        $expr: {
          $lte: [{ $subtract: ["$completedAt", "$createdAt"] }, 5 * 60 * 1000],
        },
      });
      console.log("result completedWithinFiveMin:", completedWithinFiveMin);

      if (completedWithinFiveMin) {
        console.log("You got the Lightning Fast badge", completedWithinFiveMin);
        // "Lightning Fast" – Complete a task within 5 minutes of adding it.
        await unlockBadge(userId, lightningFast._id);
      }
    }
    if (weekendWarrior?._id && !userBadges.includes(weekendWarrior._id)) {
      const itemsCompletedDuringWeekend = await SubcategoryItem.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $addFields: {
            dayOfWeek: { $dayOfWeek: "$completedAt" }, // Extract day of the week
          },
        },
        {
          $match: {
            dayOfWeek: { $in: [1, 7] }, // Match Saturday (7) or Sunday (1)
          },
        },
      ]);
      if (itemsCompletedDuringWeekend.length >= 5) {
        console.log("You got the Weekend Warrior badge");
        // "Weekend Warrior" – Complete at least 5 tasks on a weekend.
        await unlockBadge(userId, weekendWarrior._id);
      }
    }

    // "Multitasker" – Complete tasks from 3 different lists in one day.

    if (perfectWeek?.id && !userBadges.includes(perfectWeek._id)) {
      // Get the start and end of the current week (Sunday to Saturday)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      const tenItemsCompletedInOneWeek = await SubcategoryItem.aggregate([
        {
          $match: {
            userId: userId,
            completedAt: {
              $gte: startOfWeek, // Completed after the start of the week
              $lt: endOfWeek, // Completed before the end of the week
            },
          },
        },
        {
          $count: "completedTasks",
        },
        {
          $match: {
            completedTasks: { $gte: 10 }, // Check if at least 10 tasks completed
          },
        },
      ]);
      console.log(
        "result tenItemsCompletedInOneWeek:",
        tenItemsCompletedInOneWeek,
      );

      if (tenItemsCompletedInOneWeek.length > 0) {
        console.log("You got the Perfect Week badge");
        await unlockBadge(userId, perfectWeek._id);
        // 	Perfect Week - 10 items a week
      }
    }

    if (masterPlanner?.id && userBadges.includes(masterPlanner._id)) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      const hundredItemsCompletedInOneWeek = await SubcategoryItem.aggregate([
        {
          $match: {
            userId: userId,
            completedAt: {
              $gte: startOfWeek, // Completed after the start of the week
              $lt: endOfWeek, // Completed before the end of the week
            },
          },
        },
        {
          $count: "completedTasks",
        },
        {
          $match: {
            completedTasks: { $gte: 100 }, // Check if at least 10 tasks completed
          },
        },
      ]);
      console.log(
        "result hundredItemsCompletedInOneWeek:",
        hundredItemsCompletedInOneWeek,
      );
      if (hundredItemsCompletedInOneWeek.length > 0) {
        console.log("You got the Master Planner badge");
        await unlockBadge(userId, masterPlanner._id);
        // 	Master Planner - 100 items a week
      }
    }

    if (unstoppable?.id && !userBadges.includes(unstoppable._id)) {
      const startOf30DaysAgo = new Date();
      startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30); // 30 days ago
      startOf30DaysAgo.setHours(0, 0, 0, 0);

      const endOf30DaysAgo = new Date(); // Current time for comparison
      endOf30DaysAgo.setHours(23, 59, 59, 999);

      const check30DayStreak = await SubcategoryItem.aggregate([
        {
          $match: {
            userId: userId,
            completedAt: {
              $gte: startOf30DaysAgo, // Tasks completed in the last 30 days
              $lt: endOf30DaysAgo,
            },
          },
        },
        {
          $addFields: {
            completionDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
            }, // Extract the date (YYYY-MM-DD)
          },
        },
        {
          $group: {
            _id: "$completionDate", // Group by unique completion dates
          },
        },
        {
          $count: "streakDays", // Count the number of unique completion days
        },
        {
          $match: {
            streakDays: { $gte: 30 }, // Ensure the user has 30 distinct days
          },
        },
      ]);
      console.log("result check30DayStreak:", check30DayStreak);
      if (check30DayStreak.length > 30) {
        console.log("You got the Unstoppable badge");
        // "Unstoppable" – Maintain a 30-day task completion streak.
        await unlockBadge(userId, unstoppable._id);
      }
    }
    // 	Daily Planner Pro Badge → Completing at least 3 tasks per day for 30 days.

    console.log("finished badges check");
  } catch (err) {
    console.log("err", err);
  }
};
