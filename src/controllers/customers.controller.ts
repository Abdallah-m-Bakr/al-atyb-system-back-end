import { Request, Response } from "express";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from "../services/customers.service";

export const listCustomersController = async (req: Request, res: Response) => {
  const items = await listCustomers(req.query as any);
  return res.json({ items });
};

export const createCustomerController = async (req: Request, res: Response) => {
  const item = await createCustomer(req.body || {});
  return res.status(201).json({ item });
};

export const updateCustomerController = async (req: Request, res: Response) => {
  const item = await updateCustomer(req.params.id, req.body || {});

  if (!item) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.json({ item });
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  const deleted = await deleteCustomer(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.json({ success: true });
};
