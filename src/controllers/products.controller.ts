import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct
} from "../services/products.service";

export const listProductsController = async (req: Request, res: Response) => {
  const items = await listProducts(req.query as any);
  return res.json({ items });
};

export const createProductController = async (req: Request, res: Response) => {
  const item = await createProduct(req.body || {});
  return res.status(201).json({ item });
};

export const updateProductController = async (req: Request, res: Response) => {
  const item = await updateProduct(req.params.id, req.body || {});
  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ item });
};

export const deleteProductController = async (req: Request, res: Response) => {
  const deleted = await deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ success: true });
};
