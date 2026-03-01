import { Router } from "express";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import {
//   createRoomController,
//   createRoomMessageController,
//   getRoomMessagesController,
//   listRoomsController
// } from "../controllers/chat.controller";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { requireAuth } from "../middleware/requireAuth";
// import { requirePermission } from "../middleware/requirePermission";

const router = Router();

// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// router.get("/rooms", requireAuth, requirePermission("view_chat"), listRoomsController);
// router.post("/rooms", requireAuth, requirePermission("view_chat"), createRoomController);
// router.get(
//   "/rooms/:roomId/messages",
//   requireAuth,
//   requirePermission("view_chat"),
//   getRoomMessagesController
// );
// router.post(
//   "/rooms/:roomId/messages",
//   requireAuth,
//   requirePermission("chat_send_message"),
//   createRoomMessageController
// );

export default router;
