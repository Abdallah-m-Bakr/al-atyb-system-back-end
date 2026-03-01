import { Router } from "express";
import {
  changeCredentialsController,
  loginController,
  logoutController,
  meController,
  refreshController
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", authLimiter, loginController);
router.post("/refresh", authLimiter, refreshController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);
router.put("/change-credentials", requireAuth, changeCredentialsController);

export default router;
