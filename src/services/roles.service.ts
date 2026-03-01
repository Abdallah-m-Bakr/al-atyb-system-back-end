import { PERMISSIONS, PermissionKey } from "../constants/permissions";
import { RoleModel } from "../models/Role";

export const listRoles = async () => {
  return RoleModel.find().sort({ createdAt: 1 }).lean();
};

export const updateRolePermissions = async (roleId: string, permissions: PermissionKey[]) => {
  const safePermissions = permissions.filter((p) => PERMISSIONS.includes(p));

  const role = await RoleModel.findByIdAndUpdate(
    roleId,
    { $set: { permissions: safePermissions } },
    { new: true }
  ).lean();

  return role;
};
