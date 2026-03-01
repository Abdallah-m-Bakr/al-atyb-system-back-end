import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  listProductsController,
  updateProductController
} from "../controllers/products.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/", requireAuth, requirePermission("view_products"), listProductsController);
router.post("/", requireAuth, requirePermission("products_create"), createProductController);
router.put("/:id", requireAuth, requirePermission("products_edit"), updateProductController);
router.delete("/:id", requireAuth, requirePermission("products_delete"), deleteProductController);

export default router;
