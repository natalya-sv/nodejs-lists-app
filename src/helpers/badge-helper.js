import { NOT_AUTHORIZED } from "../../constants";
import { Badge } from "../models/badge";

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
import { unlockBadge } from "../controllers/badgeController";
import { Subcategory } from "../models/subcategory";
import { SubcategoryItem } from "../models/subcategoryItem";

const handleSubcategoriesCompletion = async (userId) => {
  const userSubcategoriyItems = await SubcategoryItem.find({ userId: userId });
  //before that, check what badges not to check
  if (userSubcategoriyItems.length === 1) {
    // "Task Rookie" – Complete your first task.
    //  await unlockBadge(userId, "Task Rookie");
  } else if (userSubcategoriyItems.length === 100) {
    // "Task Master" – Complete 100 tasks.
  }

  const items = await SubcategoryItem.find({ userId: userId });
  const hasItemsNotDone = items.filter((item) => !item.isDone);

  if (!hasItemsNotDone.length === 0) {
    // "Zero Inbox" – Complete all tasks in a list.
  }
  const userSubcategories = await Subcategory.count({ userId: userId });
  if (userSubcategories === 10) {
    // "List Maker" – Create 10 different lists.
    // await unlockBadge(userId, "Task Master");
  }
  const subcategoryItems = await SubcategoryItem.find({ userId: userId });
  const itemCompletedBefore8AM = subcategoryItems.find(
    (mitem) => new Date(mitem.completedAt).getHours() < 8,
  );
  const itemCompletedAfter11PM = subcategoryItems.find(
    (mitem) => new Date(mitem.completedAt).getHours() >= 23,
  );

  if (itemCompletedBefore8AM) {
    // "Early Bird" – Complete a task before 8 AM.
  }
  if (itemCompletedAfter11PM) {
    // "Night Owl" – Complete a task after 11 PM.
  }
  const completedWithinFiveMin = await SubcategoryItem.findOne({
    userId: userId,
    $expr: {
      $lte: [{ $subtract: ["$completedAt", "$createdAt"] }, 5 * 60 * 1000],
    },
  });
  if (completedWithinFiveMin) {
    // "Lightning Fast" – Complete a task within 5 minutes of adding it.
  }
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
    // "Weekend Warrior" – Complete at least 5 tasks on a weekend.
  }

  // "Multitasker" – Complete tasks from 3 different lists in one day.

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
  if (tenItemsCompletedInOneWeek.length > 0) {
    // 	Perfect Week - 10 items a week
  }
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
  if (hundredItemsCompletedInOneWeek.length > 0) {
    // 	Master Planner - 100 items a week
  }

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

  if (check30DayStreak.length > 30) {
    // "Unstoppable" – Maintain a 30-day task completion streak.
  }
  // 	Daily Planner Pro Badge → Completing at least 3 tasks per day for 30 days.
};
