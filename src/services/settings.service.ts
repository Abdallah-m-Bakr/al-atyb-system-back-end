import { SettingsModel } from "../models/Settings";

export const getDefinitions = async () => {
  const doc = await SettingsModel.findOne({ key: "definitions" }).lean();
  return doc?.categories || [];
};

export const updateDefinitions = async (categories: any[]) => {
  const updated = await SettingsModel.findOneAndUpdate(
    { key: "definitions" },
    { $set: { categories } },
    { new: true, upsert: true }
  ).lean();

  return updated?.categories || [];
};
