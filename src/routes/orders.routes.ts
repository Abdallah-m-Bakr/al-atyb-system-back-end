import { Router } from "express";
import {
  createOrderController,
  deleteOrderController,
  getOrderController,
  listOrdersController,
  updateOrderController,
  updateOrderEvaluationController,
  updateOrderStatusController
} from "../controllers/orders.controller";
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireAnyPermission(["view_history", "view_receiving", "view_preparation", "view_shipping"]),
  listOrdersController
);
router.get(
  "/:id",
  requireAuth,
  requireAnyPermission(["view_history", "view_receiving", "view_preparation", "view_shipping"]),
  getOrderController
);
router.post("/", requireAuth, requirePermission("orders_create"), createOrderController);
router.put("/:id", requireAuth, requirePermission("orders_edit"), updateOrderController);
router.delete("/:id", requireAuth, requirePermission("orders_delete"), deleteOrderController);
router.post("/:id/status", requireAuth, requirePermission("orders_change_status"), updateOrderStatusController);
router.post("/:id/evaluation", requireAuth, requirePermission("orders_edit"), updateOrderEvaluationController);

export default router;
