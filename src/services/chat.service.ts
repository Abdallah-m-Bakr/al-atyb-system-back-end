// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { Types } from "mongoose";
// import { ChatMessageModel } from "../models/ChatMessage";
// import { ChatRoomModel } from "../models/ChatRoom";

const CHAT_DISABLED_ERROR_MESSAGE = "Chat feature is temporarily unavailable in this release.";

export const ensureOrderRoom = async (_orderId: string) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // let room = await ChatRoomModel.findOne({ orderId }).lean();
  //
  // if (!room) {
  //   const created = await ChatRoomModel.create({
  //     type: "order",
  //     orderId,
  //     name: `محادثة طلب #${orderId}`,
  //     unreadCount: 0
  //   });
  //
  //   room = created.toObject();
  // }
  //
  // return room;
  return null;
};

export const listRooms = async () => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // return ChatRoomModel.find().sort({ updatedAt: -1 }).lean();
  return [];
};

export const createRoom = async (_payload: { orderId: string; name?: string }) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const existing = await ChatRoomModel.findOne({ orderId: payload.orderId }).lean();
  // if (existing) return existing;
  //
  // const created = await ChatRoomModel.create({
  //   type: "order",
  //   orderId: payload.orderId,
  //   name: payload.name || `محادثة طلب #${payload.orderId}`,
  //   unreadCount: 0
  // });
  //
  // return created.toObject();
  return null;
};

export const listRoomMessages = async (_roomId: string) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // return ChatMessageModel.find({ roomId: new Types.ObjectId(roomId) })
  //   .sort({ createdAt: 1 })
  //   .lean();
  return [];
};

export const createMessage = async (_payload: {
  roomId: string;
  senderUserId: string;
  senderName: string;
  senderRoleKey: string;
  text: string;
}) => {
  // Chat feature temporarily disabled for v1 release
  // Temporarily disabled for v1 production
  // const created = await ChatMessageModel.create({
  //   roomId: new Types.ObjectId(payload.roomId),
  //   senderUserId: new Types.ObjectId(payload.senderUserId),
  //   senderName: payload.senderName,
  //   senderRoleKey: payload.senderRoleKey,
  //   text: payload.text
  // });
  //
  // await ChatRoomModel.findByIdAndUpdate(payload.roomId, {
  //   $set: {
  //     lastMessage: payload.text,
  //     lastTimestamp: new Date()
  //   }
  // });
  //
  // return created.toObject();
  throw new Error(CHAT_DISABLED_ERROR_MESSAGE);
};
