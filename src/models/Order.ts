import { Schema, model } from "mongoose";
import { ORDER_STATUSES } from "../constants/orderStatuses";

const orderItemSchema = new Schema(
  {
    productId: { type: String, default: "" },
    productName: { type: String, required: true },
    unit: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    note: { type: String, default: "" },
    availability: { type: String, default: "Available" },
    cancelReason: { type: String, default: "" }
  },
  { _id: true }
);

const orderSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, required: true, default: Date.now },
    operationalDay: { type: String, required: true, index: true },
    status: { type: String, enum: [...ORDER_STATUSES], required: true, default: "Received" },
    customer: {
      name: { type: String, required: true },
      accountName: { type: String, default: "" },
      phones: { type: [String], default: [] },
      addresses: { type: [String], default: [] },
      tags: { type: [String], default: [] },
      previousOrdersCount: { type: Number, default: 0 },
      monthlyAverage: { type: Number, default: 0 },
      notes: { type: String, default: "" },
      deliveryFee: { type: Number, default: 0 },
      defaultDiscount: { type: Number, default: 0 },
      loyaltyPoints: { type: Number, default: 0 }
    },
    items: { type: [orderItemSchema], default: [] },
    discount: {
      type: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
      value: { type: Number, default: 0 },
      reason: { type: String, default: "" }
    },
    metadata: {
      receivingSupervisor: { type: String, default: "" },
      preparingStaff: { type: String, default: "" },
      deliveryMethod: { type: String, enum: ["Internal", "Shipping Company"], default: "Internal" },
      courierName: { type: String, default: "" },
      courierPhone: { type: String, default: "" },
      companyPhone: { type: String, default: "" },
      orderSource: { type: String, default: "WhatsApp" },
      isPaidByCourier: { type: Boolean, default: false },
      paymentMethod: { type: String, default: "Cash" },
      marketingCampaign: { type: Schema.Types.Mixed, default: "بدون حملة" },
      orderTiming: { type: String, default: "Normal" },
      orderTimingValue: { type: String, default: "" },
      loyaltyDiscountUsed: { type: Number, default: 0 }
    },
    evaluation: {
      productQuality: { type: String, default: "" },
      productQualityNote: { type: String, default: "" },
      deliverySpeed: { type: String, default: "" },
      deliverySpeedNote: { type: String, default: "" },
      courierBehavior: { type: String, default: "" },
      courierBehaviorNote: { type: String, default: "" },
      status: { type: String, default: "" },
      statusNote: { type: String, default: "" }
    },
    timestamps: {
      received: { type: Date, default: Date.now },
      preparationStarted: { type: Date, default: null },
      prepared: { type: Date, default: null },
      courierPickedUp: { type: Date, default: null },
      delivered: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

orderSchema.index({ "customer.name": 1 });

export const OrderModel = model("Order", orderSchema);
