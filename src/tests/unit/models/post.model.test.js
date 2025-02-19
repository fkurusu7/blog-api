import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Post from "../../../models/post.model";
import User from "../../../models/user.model";
import Tag from "../../../models/tag.model";
import { generateSlug } from "../../../utils/slugify";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Post.deleteMany({});
  await Tag.deleteMany({});
  await User.deleteMany({});
});

describe("Post Model", () => {
  test("should create a post with valid data", async () => {
    // ************ Arrange (setup)
    // Create a User first
    const user = new User({
      personal_info: {
        fullname: "Test User",
        email: "test@example.com",
        password: "securePassword123!",
        username: "testuser",
      },
    });
    await user.save();

    const tagDocs = await Promise.all(
      ["test", "tdd"].map(async (tagName) => {
        return await Tag.create({
          name: tagName,
          userId: user._id,
          // slug: generateSlug(tagName)
        });
      })
    );
    const tagIds = tagDocs.map((tag) => tag._id);

    // Create a post
    const postData = {
      userId: user._id,
      title: "Test Post",
      banner: "https://urltoimage.com/2z3x56cr7vtb8yo9",
      description: "This is a test post",
      content: "Test content",
      tags: tagIds,
    };

    // ************ Act (execution)
    const post = new Post(postData);
    const savedPost = await post.save();

    // ************ Assert (verify)
    expect(savedPost._id).toBeDefined();
    expect(savedPost._id).toBeDefined();
    expect(savedPost.slug).toBeDefined();
    expect(savedPost.title).toBe(savedPost.title);
    expect(savedPost.description).toBe(postData.description);
    expect(savedPost.content).toBe(postData.content);
    expect(savedPost.status).toBe("draft");
  });

  /* test("should generate a unique slug from title", async () => {});

  test("should update version and maintain history on content change", async () => {});

  test("should reject post creation without required fields", async () => {}); */
});
