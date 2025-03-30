import express from "express";
import authRouter from "./auth.route.js";
import blogRouter from "./blog.route.js";
import userRouter from "./user.route.js";

const router = express.Router();
router.use("/api/auth", authRouter);
router.use("/api/blog", blogRouter);
router.use("/api/user", userRouter);

export default router;
