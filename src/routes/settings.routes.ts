import { Router } from "express";
import {
  getDefinitionsController,
  updateDefinitionsController
} from "../controllers/settings.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/definitions", requireAuth, requirePermission("view_settings"), getDefinitionsController);
router.put(
  "/definitions",
  requireAuth,
  requirePermission("settings_edit_definitions"),
  updateDefinitionsController
);

export default router;
