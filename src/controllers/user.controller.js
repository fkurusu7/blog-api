import { z } from "zod";
import User from "../models/user.model.js";
import { updateSignedInUserSchema } from "../security/validateData.js";
import { formatResponse, setupRequestTimeout } from "../utils/helper.js";
import { info, logger, warn } from "../utils/logger.js";
import { handleZodError } from "../utils/errorHandler.js";

export const getSignedInUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    return res.status(200).json(
      formatResponse(
        true,
        {
          fullname: user.personal_info.fullname,
          email: user.personal_info.email,
          profileImg: user.personal_info.profile_img,
          posts: user.account_info.total_posts,
        },
        "success"
      )
    );
  } catch (error) {
    next(error);
  }
};

const userUpdatedinfo = (user) => {
  const { fullname, email, profile_img } = user.personal_info || {};
  return { fullname, email, profile_img };
};
export const updateSignedInUser = async (req, res, next) => {
  try {
    const start = performance.now();
    setupRequestTimeout(null, res, next);

    const { fullname, email, password, profile_img } = updateSignedInUserSchema
      .partial()
      .parse(req.body);
    const id = req.user.id;

    // build update object with only provided fields
    const updatedData = {
      ...(fullname && { "personal_info.fullname": fullname }),
      ...(email && { "personal_info.email": email }),
      ...(password && { "personal_info.password": password }),
      ...(profile_img && { "personal_info.profile_img": profile_img }),
    };
    info(JSON.stringify(updatedData));
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });
    info(user);

    if (!user) {
      throw new Error("No User found");
    }

    // clear monitoring
    const duration = performance.now() - start;
    info(
      `Post update performance ${JSON.stringify({
        duration,
        userId: id,
      })}`
    );
    res.setTimeout(0);

    // return response
    return res
      .status(200)
      .json(
        formatResponse(true, userUpdatedinfo(user), "User updated successfully")
      );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error, next);
    } else {
      next(error);
    }
  }
};
