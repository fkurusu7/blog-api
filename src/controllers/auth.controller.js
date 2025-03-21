import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import errorHandler, {
  createError,
  handleZodError,
} from "../utils/errorHandler.js";
import { signinSchema, signupSchema } from "../security/validateData.js";
import { error, info } from "../utils/logger.js";
import { formatResponse, setupRequestTimeout } from "../utils/helper.js";

const generateUsername = async (email) => {
  const username = email.split("@")[0];
  const existingUser = await User.exists({
    "personal_info.username": username,
  });

  if (!existingUser) return username;

  const uniqueSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${username}-${uniqueSuffix}`;
};

const formatUserResponse = (user, message) => {
  return {
    success: true,
    message,
    data: {
      username: user.personal_info.username,
      email: user.personal_info.email,
      profileImg: user.personal_info.profile_img,
      createdAt: user.created_at,
    },
  };
};

export const signup = async (req, res, next) => {
  try {
    // Monitoring
    setupRequestTimeout(null, res, next);
    // Validate fields from req.body and get fields from validatedData:
    // fullname, email and password. username will be generated automatically
    const { fullname, email, password } = signupSchema.parse(req.body);

    // Hash Password and generate username
    const [hashedPassword, username] = await Promise.all([
      bcryptjs.hash(password, 10),
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
    info(savedUser);
    // just return username and createdAt fields
    const formattedUserObj = formatUserResponse(savedUser);

    // Clear timeout since request completed successfully
    res.setTimeout(0);
    //  No need to create ACCESS TOKEN right now until signing in
    return res.status(201).json(formattedUserObj);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error, next);
    } else if (error.code === 11000) {
      return next(createError(409, "Email already exists"));
    } else {
      return next(error);
    }
  }
};

export const signin = async (req, res, next) => {
  try {
    setupRequestTimeout(null, res, next);

    // Validate fields (email format, password length)
    const { email, password } = signinSchema.parse(req.body);

    // Find user by email
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return next(createError(404, "Invalid credentials"));
    }

    // Validate password  with bcriptjs
    const validPassword = await bcryptjs.compare(
      password,
      user.personal_info.password
    );
    if (!validPassword) {
      return next(createError(404, "Invalid credentials"));
    }

    // generate access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Clear timeout since request completed successfully
    res.setTimeout(0);

    // return Response
    return res
      .status(200)
      .cookie(process.env.USER_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain:
          process.env.NODE_ENV === "production" ? "barudesu.codes" : undefined, // Parent domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json(formatUserResponse(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error, next);
    } else {
      return next(error);
    }
  }
};

export const signout = (req, res, next) => {
  try {
    return res.clearCookie(process.env.USER_COOKIE).sendStatus(204);
  } catch (err) {
    error("Signing out error", err);
    next(err);
  }
};

export const validateToken = (req, res, next) => {
  try {
    // If request made it past the verifyToken middleware,
    // the token is valid, so we can simply return success
    return res.status(200).json(formatResponse(true, null, "Token is valid"));
  } catch (error) {
    return next(error);
  }
};
