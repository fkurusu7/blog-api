import express from "express";
const router = express.Router();

import {
  create,
  getPosts,
  remove,
  getImageUploadUrl,
  getTags,
} from "../controllers/blog.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
// getPosts, create, getImageUploadUrl AWS-S3, fetchImageUrl

// create a post
router.post("/create", verifyToken, create);
// getPosts
router.get("/getPosts", getPosts);
// remove
router.delete("/remove", remove);

// get AWS S3 Image Upload URL
router.get("/getImageUploadUrl", getImageUploadUrl);
// get Tags
router.get("/getTags", getTags);

export default router;
