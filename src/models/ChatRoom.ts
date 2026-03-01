import { Schema, model } from "mongoose";

const chatRoomSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["order"], default: "order" },
    orderId: { type: String, required: true, index: true, unique: true },
    unreadCount: { type: Number, default: 0 },
    lastMessage: { type: String, default: "" },
    lastTimestamp: { type: Date, default: null }
  },
  { timestamps: true }
);

export const ChatRoomModel = model("ChatRoom", chatRoomSchema);
