import User from "../models/user.model.js";
import { updateSignedInUserSchema } from "../security/validateData.js";
import { formatResponse, setupRequestTimeout } from "../utils/helper.js";
import { info } from "../utils/logger.js";

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

export const updateSignedInUser = async (req, res, next) => {
  try {
    const start = performance.now();
    setupRequestTimeout(null, res, next);

    const { fullname, email, password, profile_img } =
      updateSignedInUserSchema.partial.parse(req.body);
    const id = req.user.id;

    // build update object with only provided fields
    const updatedData = {
      ...(fullname && { fullname }),
      ...(email && { email }),
      ...(password && { password }),
      ...(profile_img && { profile_img }),
    };
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!user) {
      throw new Error("No User found");
    }

    const userUpdated = user.filter();

    // clear monitoring
    const duration = performance.now() - start;
    info(
      `Post update performance ${JSON.stringify({
        duration,
        userId: id,
        fullname,
      })}`
    );
    res.setTimeout(0);

    // return response
    return res
      .status(200)
      .json(formatResponse(true, user, "User updated successfully"));
  } catch (error) {}
};
