import PocketBase, { type RecordModel } from "pocketbase";
import type { Role } from "@/lib/roles";

// Rekord z kolekcji "users": pola email, name, avatar, role (+ pola systemowe).
export type UserRecord = RecordModel & {
  email: string;
  name: string;
  avatar: string;
  role: Role;
};

// Publiczny adres PocketBase (ustawiany w Coolify jako NEXT_PUBLIC_POCKETBASE_URL).
export const POCKETBASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export const AUTH_COOKIE = "pb_auth";

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

// Tylko w przeglądarce: każda zmiana sesji (logowanie / wylogowanie / odświeżenie)
// jest zapisywana do ciasteczka, które czyta middleware.
if (typeof window !== "undefined") {
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false, // ciasteczko ustawiamy z JS, więc nie może być httpOnly
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
      path: "/",
    });
  }, true);
}
