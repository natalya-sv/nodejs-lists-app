/* eslint-env jest */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import app from "../../api/index.js";
import request from "supertest";
import { expect, test, beforeAll, afterAll } from "@jest/globals";
import { Subcategory } from "../models/subcategory.js";
import { SubcategoryItem } from "../models/subcategoryItem.js";
import { token, testUser } from "./testContext.js";

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

test("Create 35 tasks in a 3 lists", async () => {
  const subcategories = await Subcategory.find({ userId: testUser._id });

  for (let a = 0; a < subcategories.length; a++) {
    for (let i = 0; i < 35; i++) {
      const subcategoryItem = {
        title: `SubCategoryItem a ${i}`,
        description: "subcatgory item desc",
        index: `${i}`,
        isDone: false,
      };
      const res = await request(app)
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
