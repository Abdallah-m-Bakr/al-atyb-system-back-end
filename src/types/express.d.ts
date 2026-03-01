import { PermissionKey } from "../constants/permissions";

export interface AuthContext {
  userId: string;
  username: string;
  roleKey: string;
  permissions: PermissionKey[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
