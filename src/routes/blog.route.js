import express from "express";
const router = express.Router();

import { create } from "../controllers/blog.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
// getPosts, create, getImageUploadUrl AWS-S3, fetchImageUrl

// 1. create a post
router.post("/create", verifyToken, create);
// 2. getPosts

export default router;
