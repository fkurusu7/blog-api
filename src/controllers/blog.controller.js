import { z } from "zod";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createPostSchema } from "../security/validateData.js";
import { createError, handleZodError } from "../utils/errorHandler.js";
import { setupRequestTimeout } from "../utils/helper.js";
import { info, warn } from "../utils/logger.js";
import Post from "../models/post.model.js";
import { generateSlug } from "../utils/slugify.js";
import Tag from "../models/tag.model.js";

const formatResponse = (success, data, message) => ({
  success,
  data,
  message,
});

/**
 * Dynamic function to get Post(s)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * Returns an Array of Posts
 * Examples:
 * /api/blog/getPosts?userId=id
 * /api/blog/getPosts?searchTerm=javascript <== title, desc, content
 * /api/blog/getPosts?tag=javascript
 * path QUERIES:
 * searchTerm | slug | userId | startIndex | limit | order | latest
 */
export const getPosts = async (req, res, next) => {
  try {
    // for (const property in req.query) {
    //   console.log(`${property}: ${req.query[property]}`);
    // }
    // Query Modifiers:
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const latest = req.query.latest;

    // If we have a tag slug, first find the tag to get its ID
    let tagId;
    if (req.query.tag) {
      const tag = await Tag.findOne({ slug: req.query.tag });
      if (tag) {
        tagId = tag._id;
      }
    }

    // Generate Post(s) Find Query
    const posts = await Post.find({
      // draft: false, TODO: remove once the UI create/show posts
      // by postId
      ...(req.query.postId && { _id: req.query.postId }),
      // by userId
      ...(req.query.userId && { userId: req.query.userId }),
      // by slug
      ...(req.query.slug && { slug: req.query.slug }),
      // by Tag
      ...(tagId && { tags: tagId }),
      // by search term
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: `.*${req.query.searchTerm}.*`, $options: "i" } },
          {
            description: {
              $regex: `.*${req.query.searchTerm}.*`,
              $options: "i",
            },
          },
          {
            content: { $regex: `.*${req.query.searchTerm}.*`, $options: "i" },
          },
        ],
      }),
    })
      .populate(
        "userId",
        "personal_info.username personal_info.profile_img -_id"
      )
      .populate("tags", "name slug -_id")
      .sort({ createdAt: latest ? -1 : sortDirection })
      .select(
        `slug title banner description createdAt draft ${
          req.query.slug && " content banner"
        } -_id`
      )
      .skip(latest ? 0 : startIndex) // if latest, don't skip
      .limit(limit);

    // posts.forEach((post) => {
    //   info(`==> POSTS: ${JSON.stringify(post)}`);
    // });

    // Return response 200
    return res
      .status(200)
      .json(
        formatResponse(
          true,
          posts,
          `${
            posts.length === 0
              ? "No post(s) found"
              : "Posts fetched successfully"
          }`
        )
      );
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // Monitoring
    const start = performance.now();
    setupRequestTimeout(null, res, next);
    // Validate fields with Zod
    const { title, description, banner, tags, content, draft } =
      createPostSchema.parse(req.body);

    // Get userId from req
    const userId = req.user.id;
    // Valid? save Post (Create Mongo model) object
    info(
      `${userId}, ${title}, ${description}, ${banner}, ${tags}, ${content}, ${draft}`
    );
    // warn(await Post.collection.getIndexes());
    // Save data to DB

    // Get tags, look if they already exist in tag table, if exist save it, if not just... ignore it.
    const processedTags = tags.map((tag) => tag.toLowerCase().trim());
    const uniqueTags = [...new Set(processedTags)];

    // Save tags in bulk
    const tagOperations = uniqueTags.map((tagName) => ({
      updateOne: {
        filter: {
          name: tagName,
        },
        update: {
          name: tagName,
          userId,
          slug: generateSlug(tagName),
        },
        upsert: true,
      },
    }));
    await Tag.bulkWrite(tagOperations);
    const tagDocs = await Tag.find({ name: { $in: uniqueTags } });
    const tagIds = tagDocs.map((tag) => tag._id);

    const post = new Post({
      userId,
      title,
      description,
      banner,
      tags: tagIds,
      content,
      draft,
    });
    const savedPost = await post.save();

    // Log/Monitor Post creation performance
    const duration = performance.now() - start;
    info(
      `Post creation performance ${JSON.stringify({
        duration,
        userId: "404",
        tagsCount: tags.length,
      })}`
    );
    // clear monitoring
    res.setTimeout(0);
    // return response
    return res
      .status(201)
      .json(formatResponse(true, savedPost, "Post created successfully"));
  } catch (error) {
    // catch Zod errors
    if (error instanceof z.ZodError) {
      return handleZodError(error, next);
    } else if (error.code === 11000) {
      return next(createError(409, "Post title already exists"));
    } else {
      next(error);
    }
  }
};

// Get banner image URL from AWS S3
const getS3Client = () => {
  return new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

const generateAWSImageUploadURL = async () => {
  const s3Client = getS3Client();
  const date = new Date();
  const imageName = `${crypto.randomUUID().slice(0, 8)}-${date.getTime()}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    ContentType: "image/jpeg",
  });

  const urlUploadImage = await getSignedUrl(s3Client, command, {
    Expires: 1000,
  });

  return urlUploadImage;
};

export const getImageUploadUrl = async (req, res, next) => {
  try {
    const urlUploadImage = await generateAWSImageUploadURL();
    return res.status(200).json({ urlUploadImage });
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || Number.MAX_SAFE_INTEGER;
    const tags = await Tag.find({}).select("name slug -_id").limit(limit);

    return res
      .status(200)
      .json(formatResponse(true, tags, "Tags fetched successfully"));
  } catch (error) {
    next(error);
  }
};
