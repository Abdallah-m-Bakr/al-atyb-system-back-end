/**
 * Shared user sanitization utilities.
 * Centralizes the logic previously duplicated in auth.service.ts and users.service.ts.
 */

/**
 * Build the auth-response shape returned by login / refresh / me endpoints.
 * Output shape is identical to the original auth.service sanitizeUser.
 */
export const toAuthUserResponse = (user: any, roleKey: string, permissions: string[]) => {
    return {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        phone: user.phone || "",
        status: user.status,
        roleId: user.roleId,
        roleKey,
        effectivePermissions: permissions,
        userPermissionsOverride: user.userPermissionsOverride || { allow: [], deny: [] }
    };
};

/**
 * Strip sensitive fields (passwordHash, sessions) from a user document.
 * Output shape is identical to the original users.service sanitizeUser.
 */
export const stripSensitiveUserFields = (user: any) => {
    const { passwordHash, sessions, ...rest } = user;
    return rest;
};
