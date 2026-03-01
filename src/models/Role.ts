import { Schema, model } from "mongoose";

const roleSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    nameArabic: { type: String, required: true },
    permissions: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const RoleModel = model("Role", roleSchema);
