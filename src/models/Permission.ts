import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    labelArabic: { type: String, required: true }
  },
  { timestamps: true }
);

export const PermissionModel = model("Permission", permissionSchema);
