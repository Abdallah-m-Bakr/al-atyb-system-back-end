import { ProductModel } from "../models/Product";

export const listProducts = async (query: { q?: string; category?: string }) => {
  const filter: any = {};

  if (query.q) {
    filter.$or = [
      { name: new RegExp(query.q, "i") },
      { category: new RegExp(query.q, "i") }
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  return ProductModel.find(filter).sort({ createdAt: -1 }).lean();
};

export const createProduct = async (payload: any) => {
  const created = await ProductModel.create(payload);
  return ProductModel.findById(created._id).lean();
};

export const updateProduct = async (id: string, payload: any) => {
  return ProductModel.findByIdAndUpdate(id, payload, { new: true }).lean();
};

export const deleteProduct = async (id: string) => {
  const deleted = await ProductModel.findByIdAndDelete(id).lean();
  return !!deleted;
};
