import { RoleModel } from "../models/Role";
import { UserModel } from "../models/User";
import { PermissionKey } from "../constants/permissions";

export const resolveEffectivePermissions = async (
  userId: string
): Promise<{ permissions: PermissionKey[]; roleKey: string; username: string }> => {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw new Error("User not found");
  }

  const role = await RoleModel.findById(user.roleId).lean();

  if (!role) {
    throw new Error("Role not found");
  }

  const base = new Set<string>(role.permissions || []);
  const allow = new Set<string>(user.userPermissionsOverride?.allow || []);
  const deny = new Set<string>(user.userPermissionsOverride?.deny || []);

  allow.forEach((item) => base.add(item));
  deny.forEach((item) => base.delete(item));

  return {
    permissions: Array.from(base) as PermissionKey[],
    roleKey: role.key,
    username: user.username
  };
};
