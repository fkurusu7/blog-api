import { createPostSchema } from "../security/validateData";
import { createError, handleZodError } from "../utils/errorHandler";
import { setupRequestTimeout } from "../utils/helper";

export const create = async (req, res, next) => {
  try {
    // Monitoring
    setupRequestTimeout(null, res, next);
    // Validate fields with Zod
    const { title, description, banner, tags, content, draft } =
      createPostSchema.parse(req.body);

    // Valid? save Post (Create Mongo model) object

    // clean monitoring
    res.setTimeout(0);
    // return response
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
