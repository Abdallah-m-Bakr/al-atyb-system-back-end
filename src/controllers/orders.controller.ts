import { Request, Response } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrders,
  updateOrder,
  updateOrderEvaluation,
  updateOrderStatus
} from "../services/orders.service";
import {
  parseOrderCreatePayload,
  parseOrderEvaluationPayload,
  parseOrderStatusPayload,
  parseOrderUpdatePayload
} from "../validation/requestValidation";
// Chat feature temporarily disabled for v1 release
// Temporarily disabled for v1 production
// import { ensureOrderRoom } from "../services/chat.service";

export const listOrdersController = async (req: Request, res: Response) => {
  const result = await listOrders(req.query as any);
  return res.json(result);
};

export const getOrderController = async (req: Request, res: Response) => {
  const item = await getOrderById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({ item });
};

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const payload = parseOrderCreatePayload(req.body || {});
    const item = await createOrder(payload);
    // Chat feature temporarily disabled for v1 release
    // Temporarily disabled for v1 production
    // if (item) {
    //   await ensureOrderRoom(item._id.toString());
    // }
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateOrderController = async (req: Request, res: Response) => {
  try {
    const payload = parseOrderUpdatePayload(req.body || {});
    const item = await updateOrder(req.params.id, payload);

    if (!item) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const deleted = await deleteOrder(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({ success: true });
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const { status } = parseOrderStatusPayload(req.body || {});
    const nextStatus = status;
    const item = await updateOrderStatus(req.params.id, nextStatus);
    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateOrderEvaluationController = async (req: Request, res: Response) => {
  try {
    const evaluation = parseOrderEvaluationPayload(req.body || {});
    const item = await updateOrderEvaluation(req.params.id, evaluation);

    if (!item) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
