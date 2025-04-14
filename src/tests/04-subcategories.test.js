/* eslint-env jest */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import app from "../../api/index.js";
import request from "supertest";
import { Category } from "../models/category.js";
import { expect, test, beforeAll, afterAll } from "@jest/globals";
import { Subcategory } from "../models/subcategory.js";
import { token, testUser } from "./testContext.js";

// npx jest src/tests/category.test.js
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
