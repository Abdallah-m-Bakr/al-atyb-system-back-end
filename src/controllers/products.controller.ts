import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct
} from "../services/products.service";
import {
  parseProductCreatePayload,
  parseProductUpdatePayload
} from "../validation/requestValidation";

export const listProductsController = async (req: Request, res: Response) => {
  const items = await listProducts(req.query as any);
  return res.json({ items });
};

export const createProductController = async (req: Request, res: Response) => {
  try {
    const payload = parseProductCreatePayload(req.body || {});
    const item = await createProduct(payload);
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProductController = async (req: Request, res: Response) => {
  try {
    const payload = parseProductUpdatePayload(req.body || {});
    const item = await updateProduct(req.params.id, payload);
    if (!item) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  const deleted = await deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ success: true });
};
