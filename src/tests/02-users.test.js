/* eslint-env jest */

import app from "../../api/index.js";
import request from "supertest";
import { expect, test, beforeAll, afterAll } from "@jest/globals";
import { User } from "../models/user.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import context from "./testContext.js";
process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";
let mongo;
const password = "password";
let token;
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

test("Create a new user", async () => {
  // Create test user
  const res = await request(app).post("/signup").send({
    email: "user_test@test.com",
    username: "test-user",
    password: password,
  });
  const user = await res.body.user;

  expect(user).not.toBe(null);
});

test("Login as a user", async () => {
  const rest = await request(app)
    .post("/login")
    .send({ email: "user_test@test.com", password: "password" });
  token = rest.body.token;

  const createduser = await User.findById(context.testUser?._id);
  expect(createduser?.email).toBe("user_test@test.com");
});
