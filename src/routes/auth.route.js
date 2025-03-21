import express from "express";
import {
  signin,
  signout,
  signup,
  validateToken,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.post("/verify-token", verifyToken, validateToken);

export default router;
