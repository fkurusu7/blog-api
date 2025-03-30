import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getSignedInUser } from "../controllers/user.controller.js";
const router = express.Router();

router.get("/getSignedInUser", verifyToken, getSignedInUser);

export default router;
