import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";

const appTest = express();

/** Creates a test database helper that automatically applies common setup/teardown hooks
 * @param {Function} testFunction - This function contains the Test Suite
 */
export const withTestFunction = (testFunction) => {
  let mongoServer;
  let token;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup environment variables
    process.env.JWT_SECRET = "test-secret-key";
    process.env.AWS_ACCESS_KEY = "mock-access-key";
    process.env.AWS_SECRET_ACCESS_KEY = "mock-secret-key";
    process.env.AWS_BUCKET_NAME = "mock-bucket";
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    const user = new User({
      personal_info: {
        fullname: "Test User",
        email: "test@example.com",
        password: "securePassword123!",
        username: "testuser",
      },
    });
    await user.save();

    userId = user._id;
    token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET);

    // Pass token and userId to the test context
    global.__TEST_CONTEXT__ = {
      token,
      userId,
    };
  });

  testFunction();
};
