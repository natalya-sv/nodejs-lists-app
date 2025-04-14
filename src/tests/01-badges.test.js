/* eslint-env jest */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Badge } from "../models/badge.js";
import { badges } from "../../test-data.js";
import { expect, test, beforeAll, afterAll } from "@jest/globals";

let mongo;
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
