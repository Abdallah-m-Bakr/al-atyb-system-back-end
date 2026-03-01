import { Router } from "express";
import authRoutes from "./auth.routes";
import permissionRoutes from "./permissions.routes";
import roleRoutes from "./roles.routes";
import userRoutes from "./users.routes";
import orderRoutes from "./orders.routes";
import customerRoutes from "./customers.routes";
import productRoutes from "./products.routes";
import settingRoutes from "./settings.routes";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import chatRoutes from "./chat.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/orders", orderRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/settings", settingRoutes);
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// router.use("/chat", chatRoutes);

export default router;
