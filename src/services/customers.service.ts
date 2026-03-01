import { CustomerModel } from "../models/Customer";

export const listCustomers = async (query: { q?: string }) => {
  const filter = query.q
    ? {
        $or: [
          { name: new RegExp(query.q, "i") },
          { phones: new RegExp(query.q, "i") },
          { accountName: new RegExp(query.q, "i") }
        ]
      }
    : {};

  return CustomerModel.find(filter).sort({ createdAt: -1 }).lean();
};

export const createCustomer = async (payload: any) => {
  const created = await CustomerModel.create(payload);
  return CustomerModel.findById(created._id).lean();
};

export const updateCustomer = async (id: string, payload: any) => {
  return CustomerModel.findByIdAndUpdate(id, payload, { new: true }).lean();
};

export const deleteCustomer = async (id: string) => {
  const deleted = await CustomerModel.findByIdAndDelete(id).lean();
  return !!deleted;
};
