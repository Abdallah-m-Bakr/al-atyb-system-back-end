import { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  updateUserCredentials
} from "../services/users.service";

export const listUsersController = async (_req: Request, res: Response) => {
  const items = await listUsers();
  return res.json({ items });
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    if (!payload.name || !payload.roleId) {
      return res.status(400).json({ message: "name and roleId are required" });
    }

    const result = await createUser(payload);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const item = await updateUser(req.params.id, req.body || {});

    if (!item) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateUserCredentialsController = async (req: Request, res: Response) => {
  try {
    const result = await updateUserCredentials(req.params.id, req.body || {});
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const deleted = await deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ success: true });
};
