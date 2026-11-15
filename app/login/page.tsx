import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Logowanie",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      {/* Suspense jest wymagany, bo LoginForm używa useSearchParams() */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}