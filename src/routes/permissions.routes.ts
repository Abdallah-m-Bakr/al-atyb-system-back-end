import { Router } from "express";
import { permissionsController } from "../controllers/permissions.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, permissionsController);

export default router;
