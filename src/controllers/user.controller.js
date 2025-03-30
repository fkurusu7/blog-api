import User from "../models/user.model.js";
import { formatResponse } from "../utils/helper.js";
import { info } from "../utils/logger.js";

export const getSignedInUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    info(id);
    const user = await User.findById(id);
    info(user);
    return res
      .status(200)
      .json(formatResponse(true, user.personal_info.fullname, "user correct"));
  } catch (error) {
    next(error);
  }
};
