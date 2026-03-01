import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    status: { type: String, enum: ["Available", "Out of Stock", "Hidden"], default: "Available" },
    category: { type: String, required: true },
    unitPrices: { type: Schema.Types.Mixed, default: {} },
    offerDescription: { type: String, default: "" },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ProductModel = model("Product", productSchema);
