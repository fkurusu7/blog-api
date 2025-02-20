import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { withTestDatabase } from "../../tests_setup";
import User from "../../../models/user.model";
import Tag from "../../../models/tag.model";

withTestDatabase(() => {
  describe("Test Tag Model", () => {
    test("should create a tag with valid data", async () => {
      // Arrange
      const user = new User({
        personal_info: {
          fullname: "Test User",
          username: "testing_user",
          email: "test_user@example.com",
          password: "P@ssword1",
        },
      });
      await user.save();

      const tagData = { name: "javascript", userId: user._id };

      // Act
      const tag = new Tag(tagData);
      const savedTag = await tag.save();

      // Assert
      expect(savedTag._id).toBeDefined();
      expect(savedTag.name).toBe(tagData.name);
      expect(savedTag.userId.toString()).toBe(user._id.toString());
      expect(savedTag.slug).toBeDefined();
    });

    test("should reject duplicate tag names", async () => {
      // Arrange
      const user = new User({
        personal_info: {
          fullname: "Test User",
          username: "testing_user",
          email: "test_user@example.com",
          password: "P@ssword1",
        },
      });
      await user.save();

      // Act
      await Tag.create({
        name: "javascript",
        userId: user._id,
      });
      const duplicateTag = new Tag({
        name: "javascript",
        userId: user._id,
      });

      // Assert
      await expect(duplicateTag.save()).rejects.toThrow();
    });
  });
});
