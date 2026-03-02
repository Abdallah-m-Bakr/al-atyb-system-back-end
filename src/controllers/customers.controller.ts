import { Request, Response } from "express";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from "../services/customers.service";
import {
  parseCustomerCreatePayload,
  parseCustomerUpdatePayload
} from "../validation/requestValidation";

export const listCustomersController = async (req: Request, res: Response) => {
  const items = await listCustomers(req.query as any);
  return res.json({ items });
};

export const createCustomerController = async (req: Request, res: Response) => {
  try {
    const payload = parseCustomerCreatePayload(req.body || {});
    const item = await createCustomer(payload);
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateCustomerController = async (req: Request, res: Response) => {
  try {
    const payload = parseCustomerUpdatePayload(req.body || {});
    const item = await updateCustomer(req.params.id, payload);

    if (!item) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  const deleted = await deleteCustomer(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.json({ success: true });
};
