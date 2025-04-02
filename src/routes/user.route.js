import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getSignedInUser,
  updateSignedInUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/getSignedInUser", verifyToken, getSignedInUser);
router.put("/updateSignedInUser", verifyToken, updateSignedInUser);

export default router;
