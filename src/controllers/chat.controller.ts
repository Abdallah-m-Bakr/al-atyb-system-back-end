import { Request, Response } from "express";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import {
//   createMessage,
//   createRoom,
//   ensureOrderRoom,
//   listRoomMessages,
//   listRooms
// } from "../services/chat.service";

const CHAT_DISABLED_MESSAGE = "Chat feature is temporarily unavailable in this release.";

export const listRoomsController = async (_req: Request, res: Response) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const items = await listRooms();
  // return res.json({ items });
  return res.status(503).json({ message: CHAT_DISABLED_MESSAGE });
};

export const createRoomController = async (req: Request, res: Response) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const { orderId, name } = req.body || {};
  //
  // if (!orderId) {
  //   return res.status(400).json({ message: "orderId is required" });
  // }
  //
  // const item = await createRoom({ orderId, name });
  // return res.status(201).json({ item });
  void req;
  return res.status(503).json({ message: CHAT_DISABLED_MESSAGE });
};

export const getRoomMessagesController = async (req: Request, res: Response) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const items = await listRoomMessages(req.params.roomId);
  // return res.json({ items });
  void req;
  return res.status(503).json({ message: CHAT_DISABLED_MESSAGE });
};

export const createRoomMessageController = async (req: Request, res: Response) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // if (!req.auth) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  //
  // const text = String(req.body?.text || "").trim();
  //
  // if (!text) {
  //   return res.status(400).json({ message: "text is required" });
  // }
  //
  // const item = await createMessage({
  //   roomId: req.params.roomId,
  //   senderUserId: req.auth.userId,
  //   senderName: req.auth.username,
  //   senderRoleKey: req.auth.roleKey,
  //   text
  // });
  //
  // return res.status(201).json({ item });
  void req;
  return res.status(503).json({ message: CHAT_DISABLED_MESSAGE });
};

export const ensureOrderRoomController = async (req: Request, res: Response) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const { orderId } = req.body || {};
  //
  // if (!orderId) {
  //   return res.status(400).json({ message: "orderId is required" });
  // }
  //
  // const item = await ensureOrderRoom(orderId);
  // return res.json({ item });
  void req;
  return res.status(503).json({ message: CHAT_DISABLED_MESSAGE });
};
