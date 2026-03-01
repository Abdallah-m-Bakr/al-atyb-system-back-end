import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserController,
  updateUserCredentialsController
} from "../controllers/users.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("view_staff"), listUsersController);
router.post("/", requireAuth, requirePermission("staff_create"), createUserController);
router.put("/:id", requireAuth, requirePermission("staff_edit"), updateUserController);
router.put(
  "/:id/credentials",
  requireAuth,
  requirePermission("staff_edit"),
  updateUserCredentialsController
);
router.delete("/:id", requireAuth, requirePermission("staff_delete"), deleteUserController);

export default router;
