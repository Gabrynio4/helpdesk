// Plik bez zależności od PocketBase, dzięki czemu działa też w middleware.

export type Role = "user" | "admin";

// Strona, na którą trafia użytkownik po zalogowaniu (zależnie od roli).
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  user: "/user",
};

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "user";
}

// Admin ma dostęp do wszystkiego, zwykły użytkownik tylko do /user.
export function canAccess(role: Role, pathname: string): boolean {
  if (role === "admin") return true;
  return pathname === "/user" || pathname.startsWith("/user/");
}