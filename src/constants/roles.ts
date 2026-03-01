import { PermissionKey } from "./permissions";

export const ROLE_KEYS = [
  "receiving_officer",
  "preparation_officer",
  "pilot",
  "management",
  "general_manager"
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export interface SeedRoleDefinition {
  key: RoleKey;
  nameArabic: string;
  permissions: PermissionKey[];
}
