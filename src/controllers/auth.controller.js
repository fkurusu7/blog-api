import { z } from "zod";
import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";
import { createError } from "../utils/errorHandler.js";
import { signupSchema } from "../utils/validateData.js";

const generateUsername = async (email) => {
  const username = email.split("@")[0];
  const isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  });
  return isUsernameNotUnique
    ? username + crypto.randomUUID().split("-").join("").slice(0, 16)
    : username;
};

const formatUserObject = (savedUser) => {
  return {
    success: true,
    username: savedUser.personal_info.username,
    createdAt: savedUser.createdAt,
  };
};

export const signup = async (req, res, next) => {
  try {
    // Validate fields from req.body and get fields from validatedData:
    // fullname, email and password. username will be generated automatically
    const { fullname, email, password } = signupSchema.parse(req.body);

    // Hash Password and generate username
    const [hashedPassword, username] = await Promise.all([
      bcryptjs.hashSync(password, 10),
      generateUsername(email),
    ]);

    // Create User
    const user = new User({
      personal_info: {
        fullname,
        username,
        email,
        password: hashedPassword,
      },
    });

    // Save user
    const savedUser = await user.save();
    // just return username and createdAt fields
    const formattedUserObj = formatUserObject(savedUser);

    //  No need to create ACCESS TOKEN right now until signing in
    return res.status(201).json(formattedUserObj);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(createError(400, JSON.stringify(errorMessage)));
    } else if (error.code === 11000) {
      return next(createError(409, "Email already exists"));
    } else {
      return next(error);
    }
  }
};
