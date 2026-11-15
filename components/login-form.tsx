"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { AlertCircle, Loader2 } from "lucide-react";

import { pb, type UserRecord } from "@/lib/pocketbase";
import { ROLE_HOME, canAccess, isRole, type Role } from "@/lib/roles";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Wraca na stronę, z której wyrzucił nas middleware (?next=...), ale tylko
// jeśli jest wewnętrzna i dozwolona dla roli. W przeciwnym razie strona główna roli.
function getRedirect(next: string | null, role: Role): string {
  const safe = next && next.startsWith("/") && !next.startsWith("//");
  if (safe && canAccess(role, next.split("?")[0])) return next;
  return ROLE_HOME[role];
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { record } = await pb
        .collection("users")
        .authWithPassword<UserRecord>(email, password);

      // Ciasteczko jest zapisywane automatycznie (patrz lib/pocketbase.ts).
      if (!isRole(record.role)) {
        pb.authStore.clear();
        setError("Twoje konto nie ma przypisanej roli. Skontaktuj się z administratorem.");
        return;
      }

      router.replace(getRedirect(searchParams.get("next"), record.role));
      router.refresh();
    } catch (err) {
      if (err instanceof ClientResponseError) {
        if (err.status === 400) {
          setError("Nieprawidłowy adres e-mail lub hasło.");
        } else if (err.status === 0) {
          setError("Nie można połączyć się z serwerem. Spróbuj ponownie.");
        } else {
          setError("Nie udało się zalogować. Spróbuj ponownie później.");
        }
      } else {
        setError("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Zaloguj się</CardTitle>
        <CardDescription>
          Podaj adres e-mail i hasło, aby przejść do aplikacji.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@example.com"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}