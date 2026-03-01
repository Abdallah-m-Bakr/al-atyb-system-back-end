import { Router } from "express";
import {
  listRolesController,
  updateRolePermissionsController
} from "../controllers/roles.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("view_staff"), listRolesController);
router.put(
  "/:id/permissions",
  requireAuth,
  requirePermission("roles_edit_permissions"),
  updateRolePermissionsController
);

export default router;
