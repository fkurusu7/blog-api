import express from "express";
const router = express.Router();

import { create } from "../controllers/blog.controller";
// getPosts, create, getImageUploadUrl AWS-S3, fetchImageUrl

// 1. create a post
router.post("/create", create);
// 2. getPosts

export default router;
