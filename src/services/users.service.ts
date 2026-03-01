import { randomPassword } from "../utils/credentials";
import { hashPassword } from "../utils/hash";
import { RoleModel } from "../models/Role";
import { UserModel } from "../models/User";
import { stripSensitiveUserFields } from "../utils/sanitize";



export const listUsers = async () => {
  const users = await UserModel.find().populate("roleId").sort({ createdAt: -1 }).lean();
  return users.map(stripSensitiveUserFields);
};

export const createUser = async (input: {
  name: string;
  phone?: string;
  roleId: string;
  username?: string;
  password?: string;
  status?: "Active" | "Suspended";
  userPermissionsOverride?: { allow: string[]; deny: string[] };
}) => {
  const role = await RoleModel.findById(input.roleId).lean();

  if (!role) {
    throw new Error("Role not found");
  }

  const fallbackUsername = `${role.key}_${Math.floor(100 + Math.random() * 899)}`;
  const username = input.username?.trim() || fallbackUsername;
  const password = input.password || randomPassword(12);
  const passwordHash = await hashPassword(password);

  const created = await UserModel.create({
    name: input.name,
    phone: input.phone || "",
    status: input.status || "Active",
    roleId: input.roleId,
    username,
    passwordHash,
    userPermissionsOverride: input.userPermissionsOverride || { allow: [], deny: [] }
  });

  const user = await UserModel.findById(created._id).populate("roleId").lean();
  return {
    user: stripSensitiveUserFields(user),
    generatedCredentials: { username, password }
  };
};

export const updateUser = async (
  userId: string,
  input: {
    name?: string;
    phone?: string;
    roleId?: string;
    status?: "Active" | "Suspended";
    userPermissionsOverride?: { allow: string[]; deny: string[] };
  }
) => {
  if (input.roleId) {
    const role = await RoleModel.findById(input.roleId).lean();
    if (!role) {
      throw new Error("Role not found");
    }
  }

  const updated = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.roleId !== undefined ? { roleId: input.roleId } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.userPermissionsOverride !== undefined
          ? { userPermissionsOverride: input.userPermissionsOverride }
          : {})
      }
    },
    { new: true }
  )
    .populate("roleId")
    .lean();

  return updated ? stripSensitiveUserFields(updated) : null;
};

export const updateUserCredentials = async (
  userId: string,
  input: { username?: string; password?: string; regenerate?: boolean }
) => {
  const existing = await UserModel.findById(userId).lean();
  if (!existing) {
    throw new Error("User not found");
  }

  const username = input.regenerate
    ? `${existing.username.split("_")[0] || "user"}_${Math.floor(100 + Math.random() * 899)}`
    : input.username || existing.username;

  const password = input.regenerate ? randomPassword(12) : input.password;

  const updatePayload: Record<string, unknown> = { username };

  if (password) {
    updatePayload.passwordHash = await hashPassword(password);
  }

  await UserModel.findByIdAndUpdate(userId, { $set: updatePayload });

  const updated = await UserModel.findById(userId).populate("roleId").lean();

  return {
    user: updated ? stripSensitiveUserFields(updated) : null,
    generatedCredentials: {
      username,
      ...(password ? { password } : {})
    }
  };
};

export const deleteUser = async (userId: string) => {
  const deleted = await UserModel.findByIdAndDelete(userId).lean();
  return !!deleted;
};
