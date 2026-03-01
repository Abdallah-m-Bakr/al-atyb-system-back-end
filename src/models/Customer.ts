import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    accountName: { type: String, default: "" },
    phones: { type: [String], default: [] },
    addresses: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    previousOrdersCount: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    deliveryFee: { type: Number, default: 35 },
    defaultDiscount: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export const CustomerModel = model("Customer", customerSchema);
