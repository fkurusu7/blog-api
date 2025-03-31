import User from "../models/user.model.js";
import { formatResponse } from "../utils/helper.js";
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
