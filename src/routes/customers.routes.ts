import { Router } from "express";
import {
  createCustomerController,
  deleteCustomerController,
  listCustomersController,
  updateCustomerController
} from "../controllers/customers.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("view_customers"), listCustomersController);
router.post("/", requireAuth, requirePermission("customers_create"), createCustomerController);
router.put("/:id", requireAuth, requirePermission("customers_edit"), updateCustomerController);
router.delete("/:id", requireAuth, requirePermission("customers_delete"), deleteCustomerController);

export default router;
