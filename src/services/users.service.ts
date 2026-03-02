import { hashPassword } from "../utils/hash";
import { RoleModel } from "../models/Role";
import { UserModel } from "../models/User";
import { stripSensitiveUserFields } from "../utils/sanitize";

const normalizeUsername = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
};

const defaultPasswordForUsername = (username: string): string => {
  return `${username}123456`;
};

const ensureUniqueUsername = async (username: string, excludeUserId?: string): Promise<void> => {
  const query = excludeUserId
    ? { username, _id: { $ne: excludeUserId } }
    : { username };

  const exists = await UserModel.exists(query);
  if (exists) {
    throw new Error("username already exists");
  }
};

const generateRoleBasedUsername = async (roleKey: string): Promise<string> => {
  const base = normalizeUsername(roleKey);
  let candidate = base;
  let suffix = 1;

  while (await UserModel.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${base}_${suffix}`;
  }

  return candidate;
};

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
  userPermissionsOverride?: { allow?: string[]; deny?: string[] };
}) => {
  const role = await RoleModel.findById(input.roleId).lean();

  if (!role) {
    throw new Error("Role not found");
  }

  let username: string;
  if (input.username?.trim()) {
    username = normalizeUsername(input.username);
    await ensureUniqueUsername(username);
  } else {
    username = await generateRoleBasedUsername(role.key);
  }

  const password = input.password?.trim() || defaultPasswordForUsername(username);
  const passwordHash = await hashPassword(password);

  const created = await UserModel.create({
    name: input.name,
    phone: input.phone || "",
    status: input.status || "Active",
    roleId: input.roleId,
    username,
    passwordHash,
    userPermissionsOverride: {
      allow: input.userPermissionsOverride?.allow || [],
      deny: input.userPermissionsOverride?.deny || []
    }
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
    userPermissionsOverride?: { allow?: string[]; deny?: string[] };
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
          ? {
              userPermissionsOverride: {
                allow: input.userPermissionsOverride.allow || [],
                deny: input.userPermissionsOverride.deny || []
              }
            }
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

  let username = existing.username;

  if (input.username?.trim()) {
    username = normalizeUsername(input.username);
  }

  await ensureUniqueUsername(username, userId);

  const shouldResetPassword = Boolean(input.regenerate || input.password);
  const password = input.regenerate
    ? defaultPasswordForUsername(username)
    : input.password?.trim();

  const updatePayload: Record<string, unknown> = { username };

  if (shouldResetPassword && password) {
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
