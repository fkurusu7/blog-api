import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import request from "supertest";

import { withTestFunction } from "../tests_setup";
import Tag from "../../../models/tag.model";
import blogRouter from "../../../routes/blog.route";
import errorHandler from "../../../utils/errorHandler";
import Post from "../../../models/post.model";

// Mock logger
jest.mock("../../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const appTest = express();

appTest.use(bodyParser.json());
appTest.use(bodyParser.urlencoded({ extended: true }));
appTest.use(cookieParser());
appTest.use("/api/blog", blogRouter);
appTest.use(errorHandler);

withTestFunction(() => {
  describe("Test Blog Controller", () => {
    const postURL = `/api/blog`;
    const postCreateURL = `${postURL}/create`;
    const postUpdateURL = `${postURL}/update`;
    const postDeleteURL = `${postURL}/create`;

    const postData = {
      title: "Test Post",
      description: "This is a test post",
      content: "<p>Test content</p>",
      tags: ["test", "nodejs"],
      draft: true,
    };
    describe("Test Create a post", () => {
      test("should return validation error for missing fields", async () => {
        const { token } = global.__TEST_CONTEXT__;
        const incompletePostData = {
          title: "Test Post",
          // Missing description
          content: "<p>Test content</p>",
          // missing
          draft: true,
        };
        const response = await request(appTest)
          .post(postCreateURL)
          .set("Cookie", [`user_token=${token}`])
          .send(incompletePostData);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
      }); // <TEST ends>

      test("should return status 401 if token is missing", async () => {
        const response = await request(appTest)
          .post(postCreateURL)
          .send(postData);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized");
        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(401);
      }); // <TEST ends>

      test("should create a post successfully (with tags)", async () => {
        const { token, userId } = global.__TEST_CONTEXT__;

        const response = await request(appTest)
          .post(postCreateURL)
          .set("Cookie", [`user_token=${token}`])
          .send(postData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.title).toBe(postData.title);
        expect(response.body.data.description).toBe(postData.description);
        expect(response.body.data.content).toBe(postData.content);
        expect(response.body.data.userId).toBe(userId.toString());

        // Verify if tags were created
        const createdTags = await Tag.find({ name: { $in: postData.tags } });
        expect(createdTags.length).toBe(2);
      }); // <TEST ends>
    }); // <Create DESCRIBE ends>

    describe("Test Update a post", () => {
      test("should update an existing post", async () => {
        const { token, userId } = global.__TEST_CONTEXT__;

        const tagDocs = await Promise.all(
          ["test", "tdd"].map(async (tagName) => {
            return await Tag.create({
              name: tagName,
              userId,
              // slug: generateSlug(tagName)
            });
          })
        );
        const tagIds = tagDocs.map((tag) => tag._id);

        const existingPost = new Post({
          title: "Test Post",
          description: "This is a test post",
          content: "<p>Test content</p>",
          tags: tagIds,
          draft: true,
          userId,
        });
        const existingPostResponse = await existingPost.save();

        const updateExistingPostData = {
          title: "Updated ==> Test Post",
        };
        const response = await request(appTest)
          .put(`${postUpdateURL}/${existingPost.slug}`)
          .set("Cookie", [`user_token=${token}`])
          .send(updateExistingPostData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updateExistingPostData.title);
      });
    });
  }); // <outer DESCRIBE ends>
});
