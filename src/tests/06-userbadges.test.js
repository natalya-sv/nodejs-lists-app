/* eslint-env jest */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Badge } from "../models/badge.js";
import { badges } from "../../test-data.js";
import { expect, test, beforeAll, afterAll } from "@jest/globals";
import { UserBadge } from "../models/userBadge.js";

let mongo;
import { token, testUser } from "./testContext.js";

process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

beforeAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
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
