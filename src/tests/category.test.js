/* eslint-env jest */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Badge } from "../models/badge.js";
import { UserBadge } from "../models/userBadge.js";
import { badges } from "../../test-data.js";
import app from "../../api/index.js";
import request from "supertest";
import { Category } from "../models/category.js";
import { expect, test, beforeAll, afterAll } from "@jest/globals";

let mongo;
let testUser;
let token = "";
const password = "password";
const isDev = process.env.NODE_ENV === "development";
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
  if (isDev) {
    // await mongoose.connection.dropDatabase();
  }
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

test("Assign 'Category Rookie' badge after creating 3 categories", async () => {
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
        userId: testUser._id,
        ...category,
      });
    expect(res.body.error).toBe(false);
  }
  const categories = await Category.find({ userId: testUser._id });
  expect(categories.length).toBe(3);
});

test("User has rookie badge", async () => {
  const rookieBadge = await Badge.find({ name: "Category Rookie" });
  const userBadges = await UserBadge.find({ userId: testUser._id });
  const res = userBadges.find((b) => b.badgeId === rookieBadge._id);
  expect(res).not.toBe(null);
});
