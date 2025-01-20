import express from "express";
const router = express.Router();

import {
  create,
  getImageUploadUrl,
  getPosts,
  getTags,
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
// getPosts, create, getImageUploadUrl AWS-S3, fetchImageUrl

// create a post
router.post("/create", verifyToken, create);
// getPosts
router.get("/getPosts", getPosts);
// get AWS S3 Image Upload URL
router.get("/getImageUploadUrl", getImageUploadUrl);
// get Tags
router.get("/getTags", getTags);

export default router;
