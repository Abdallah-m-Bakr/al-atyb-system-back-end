import { Schema, model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "definitions" },
    categories: {
      type: [
        {
          id: { type: String, required: true },
          label: { type: String, required: true },
          description: { type: String, default: "" },
          items: {
            type: [
              {
                name: { type: String, required: true },
                active: { type: Boolean, default: true },
                sortOrder: { type: Number, default: 0 }
              }
            ],
            default: []
          }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export const SettingsModel = model("Settings", settingsSchema);
