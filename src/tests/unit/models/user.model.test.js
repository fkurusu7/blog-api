import User from "../../../models/user.model";
import { withTestDatabase } from "./tests_setup";

withTestDatabase(() => {
  describe("Test User Model", () => {
    test("should create a new user with valid data", async () => {
      // Arrange
      const userData = {
        personal_info: {
          fullname: "Test User",
          username: "testing_user",
          email: "test_user@example.com",
          password: "P@ssword1",
        },
      };

      // Act
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert
      expect(savedUser._id).toBeDefined();
      expect(savedUser.personal_info.fullname).toBe(
        userData.personal_info.fullname.toLowerCase()
      );
      expect(savedUser.personal_info.email).toBe(userData.personal_info.email);
      expect(savedUser.personal_info.username).toBe(
        userData.personal_info.username
      );
    });

    test("should reject duplicate email address", async () => {
      // Arrange
      const userData1 = {
        personal_info: {
          fullname: "Test User 1",
          username: "testing_user_1",
          email: "test_user@example.com",
          password: "P@ssword1",
        },
      };
      const userData2 = {
        personal_info: {
          fullname: "Test User 2",
          username: "testing_user_2",
          email: "test_user@example.com",
          password: "P@ssword1",
        },
      };

      // Act
      await new User(userData1).save();
      const duplicateUser = new User(userData2);

      // Assert
      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });
});
