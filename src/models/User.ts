import { Schema, model } from "mongoose";

const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true },
    refreshTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" }
  },
  { _id: false, timestamps: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    passwordHash: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    userPermissionsOverride: {
      allow: { type: [String], default: [] },
      deny: { type: [String], default: [] }
    },
    sessions: { type: [sessionSchema], default: [] }
  },
  { timestamps: true }
);

export const UserModel = model("User", userSchema);
