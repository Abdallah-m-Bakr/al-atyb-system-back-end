import { FilterQuery } from "mongoose";
import { OrderStatus } from "../constants/orderStatuses";
import { OrderModel } from "../models/Order";

const toDate = (value?: string) => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export const listOrders = async (query: {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: FilterQuery<any> = {};

  if (query.status) {
    filter.status = query.status;
  }

  const from = toDate(query.from);
  const to = toDate(query.to);

  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {})
    };
  }

  if (query.q) {
    const regex = new RegExp(query.q, "i");
    filter.$or = [
      { invoiceNumber: regex },
      { "customer.name": regex },
      { "customer.phones": regex }
    ];
  }

  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 200);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getOrderById = async (orderId: string) => {
  return OrderModel.findById(orderId).lean();
};

export const createOrder = async (payload: any) => {
  const created = await OrderModel.create(payload);
  return OrderModel.findById(created._id).lean();
};

export const updateOrder = async (orderId: string, payload: any) => {
  const safePayload = { ...(payload || {}) };
  delete safePayload.status;
  return OrderModel.findByIdAndUpdate(orderId, safePayload, { new: true }).lean();
};

export const deleteOrder = async (orderId: string) => {
  const deleted = await OrderModel.findByIdAndDelete(orderId).lean();
  return !!deleted;
};

export const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  order.status = nextStatus;

  await order.save();
  return order.toObject();
};

export const updateOrderEvaluation = async (orderId: string, evaluation: Record<string, unknown>) => {
  const updated = await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: { evaluation } },
    { new: true }
  ).lean();

  return updated;
};
