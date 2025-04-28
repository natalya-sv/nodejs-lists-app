import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import app from "../../api/index.js";
import request from "supertest";
import { Category } from "../models/category.js";
import { expect, test, beforeAll, afterAll } from "@jest/globals";
import { Badge } from "../models/badge.js";
import { UserBadge } from "../models/userBadge.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";
import { Subcategory } from "../models/subcategory.js";
import { User } from "../models/user.js";
import { badges } from "../../test-data.js";

// npx jest src/tests/category.test.js
let mongo;
let token;
let testUser;
let password = "password";
process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  // Create a new in-memory MongoDB server
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Connect to the in-memory MongoDB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

test("Create badges", async () => {
  for (let i = 0; i < badges.length; i++) {
    const badge = new Badge({
      name: badges[i].name,
      description: badges[i].description,
      icon: badges[i].icon,
      criteria: badges[i].criteria,
      badgeType: badges[i].badgeType,
    });
    await badge.save();
    // rookieBadgeId = badges[1]._id;
  }
  const createdBadges = await Badge.find();

  expect(createdBadges.length).toBe(badges.length);
});

test("Create a new user", async () => {
  // Create test user
  const res = await request(app).post("/signup").send({
    email: "user_test@test.com",
    username: "test-user",
    password: password,
  });
  const user = await res.body.user;
  testUser = user;
  const rest = await request(app)
    .post("/login")
    .send({ email: testUser?.email, password: password });
  token = rest.body.token;
});
test("User exists", async () => {
  const user = await User.findById(testUser?._id);
  expect(user.email).toBe("user_test@test.com");
});

test("Creating 3 categories", async () => {
  for (let i = 1; i <= 3; i++) {
    const category = {
      title: `Category ${i}`,
      icon: `icon-${i}`,
      color: `#ff5722`,
    };
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: testUser?._id,
        ...category,
      });
    expect(res.body.error).toBe(false);
  }
  const categories = await Category.find({ userId: testUser?._id });
  expect(categories.length).toBe(3);
});

test("Create 3 subcategories", async () => {
  const userCategories = await Category.find({ userId: testUser._id });
  for (let i = 0; i < 3; i++) {
    const subcategory = {
      title: `SubCategory ${i}`,
    };

    await request(app)
      .post(`/subcategories/${userCategories[i]?._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: testUser._id,
        ...subcategory,
      });
  }
  const subcategories = await Subcategory.find({ userId: testUser._id });
  expect(subcategories.length).toBe(3);
});

test("Create 35 tasks in a 3 lists", async () => {
  const subcategories = await Subcategory.find({ userId: testUser._id });
  console.log(subcategories);

  for (let a = 0; a < subcategories.length; a++) {
    for (let i = 0; i < 35; i++) {
      const subcategoryItem = {
        title: `SubCategoryItem a ${i}`,
        description: "subcatgory item desc",
        index: `${i}`,
        isDone: false,
      };
      await request(app)
        .post(`/subcategory-items/${subcategories[a]?._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          userId: testUser._id,
          ...subcategoryItem,
        });
    }
  }
  const subcategoryItems = await SubcategoryItem.find({ userId: testUser._id });
  expect(subcategoryItems.length).toBe(105);
});

test("Complege 100 tasks in a 3 lists", async () => {
  const subcategoryItems = await SubcategoryItem.find({ userId: testUser._id });

  for (let i = 0; i < subcategoryItems.length; i++) {
    const subcategoryItem = {
      ...subcategoryItems[i],
      isDone: true,
    };

    await request(app)
      .put(`/subcategory-items/${subcategoryItems[i]?._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: testUser._id,
        ...subcategoryItem,
      });
  }
  const subcategoryItemsDone = await SubcategoryItem.find({
    userId: testUser._id,
    isDone: true,
  });
  expect(subcategoryItemsDone.length).toBe(105);
});
test("User has rookie badge", async () => {
  const rookieBadge = await Badge.find({ name: "Category Rookie" });
  const userBadges = await UserBadge.find({ userId: testUser._id });
  const res = userBadges.find((b) => b.badgeId === rookieBadge._id);
  expect(res).not.toBe(null);
});

test("User has task master badge", async () => {
  const rookieBadge = await Badge.find({ name: "Task Master" });
  const userBadges = await UserBadge.find({ userId: testUser._id });
  const res = userBadges.find((b) => b.badgeId === rookieBadge._id);
  expect(res).not.toBe(null);
});
