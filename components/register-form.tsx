"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { AlertCircle, Loader2 } from "lucide-react";

import { pb, type UserRecord } from "@/lib/pocketbase";
import { getRedirectTarget, isRole } from "@/lib/roles";
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

const MIN_PASSWORD_LENGTH = 8;

type Props = {
  onSwitchToLogin: () => void;
};

function describeError(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 0) {
      return "Nie można połączyć się z serwerem. Spróbuj ponownie.";
    }
    if (err.status === 403) {
      return "Zakładanie kont jest obecnie wyłączone.";
    }
    const data = err.response?.data ?? {};
    if (data.email?.code === "validation_not_unique") {
      return "Konto z tym adresem e-mail już istnieje.";
    }
    if (data.email) return "Podaj poprawny adres e-mail.";
    if (data.password) {
      return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
    }
  }
  return "Nie udało się założyć konta. Spróbuj ponownie później.";
}

export function RegisterForm({ onSwitchToLogin }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }
    if (password !== passwordConfirm) {
      setError("Hasła nie są takie same.");
      return;
    }

    setLoading(true);
    try {
      // rola zawsze user
      await pb.collection("users").create({
        name,
        email,
        password,
        passwordConfirm,
        role: "user",
      });

      // or razu po utworzeniu konta logowanie
      const { record } = await pb
        .collection("users")
        .authWithPassword<UserRecord>(email, password);

      if (!isRole(record.role)) {
        pb.authStore.clear();
        setError("Konto zostało utworzone, ale nie ma przypisanej roli.");
        return;
      }

      router.replace(getRedirectTarget(searchParams.get("next"), record.role));
      router.refresh();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Załóż konto</CardTitle>
        <CardDescription>
          Wypełnij formularz, aby utworzyć nowe konto.
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
            <Label htmlFor="reg-name">Imię</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-email">Adres e-mail</Label>
            <Input
              id="reg-email"
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
            <Label htmlFor="reg-password">Hasło</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-password-confirm">Powtórz hasło</Label>
            <Input
              id="reg-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Tworzenie konta..." : "Załóż konto"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={onSwitchToLogin}
            >
              Zaloguj się
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
