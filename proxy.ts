import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, canAccess, isRole, type Role } from "@/lib/roles";

const COOKIE = "pb_auth";

// Opcjonalnie: wewnętrzny adres PocketBase w sieci Coolify (szybszy, bez wyjścia do internetu).
// Jeśli go nie ustawisz, używany jest adres publiczny.
const PB_URL =
  process.env.POCKETBASE_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_POCKETBASE_URL ??
  "http://127.0.0.1:8090";

function readToken(raw: string | undefined): string | null {
  if (!raw) return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}
  for (const candidate of [raw, decoded]) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed?.token === "string") return parsed.token;
    } catch {}
  }
  return null;
}

// Sprawdza token w PocketBase i zwraca ROLĘ Z BAZY (a nie z ciasteczka,
// które użytkownik mógłby podrobić).
async function verifyRole(token: string): Promise<Role | null> {
  try {
    const res = await fetch(
      `${PB_URL}/api/collections/users/auth-refresh`,
      { method: "POST", headers: { Authorization: token }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return isRole(data?.record?.role) ? data.record.role : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/login";

  const token = readToken(request.cookies.get(COOKIE)?.value);
  const role = token ? await verifyRole(token) : null;

  // Niezalogowany lub nieważny token
  if (!role) {
    if (isLogin) {
      const res = NextResponse.next();
      if (token) res.cookies.delete(COOKIE);
      return res;
    }
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(COOKIE);
    return res;
  }

  // Zalogowany: /login i / kierują na stronę właściwą dla roli,
  // tak samo próba wejścia tam, gdzie rola nie ma dostępu.
  if (isLogin || pathname === "/" || !canAccess(role, pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};