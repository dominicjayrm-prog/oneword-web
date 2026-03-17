// Admin user ID
export const ADMIN_USER_ID = '99ce4025-2d10-4549-8afc-63cd9f5675fc';

export function isAdmin(userId: string | undefined | null): boolean {
  if (!userId) return false;
  return userId === ADMIN_USER_ID;
}
