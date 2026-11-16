import PocketBase, { type RecordModel } from "pocketbase";
import type { Role } from "@/lib/roles";

// rekord z users
export type UserRecord = RecordModel & {
  email: string;
  name: string;
  avatar: string;
  role: Role;
};

// adres pb.
export const POCKETBASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export const AUTH_COOKIE = "pb_auth";

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

if (typeof window !== "undefined") {
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false, // cookie ustawiony w js, nie http
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
      path: "/",
    });
  }, true);
}
