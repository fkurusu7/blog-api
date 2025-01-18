import { z } from "zod";
import { createPostSchema } from "../security/validateData.js";
import { createError, handleZodError } from "../utils/errorHandler.js";
import { setupRequestTimeout } from "../utils/helper.js";
import { info, warn } from "../utils/logger.js";
import Post from "../models/post.model.js";

const formatResponse = (success, data, message) => ({
  success,
  data,
  message,
});

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
    // API call
    const post = new Post({
      userId,
      title,
      description,
      banner,
      tags,
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
    // error 11000 Post already exists by name
    // catch any error
  }
};
