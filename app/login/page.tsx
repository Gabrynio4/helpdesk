import { Suspense } from "react";
import { AuthSwitcher } from "@/components/auth-switcher";

export const metadata = {
  title: "Logowanie",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      {/* Suspense jest wymagany, bo formularze używają useSearchParams() */}
      <Suspense>
        <AuthSwitcher />
      </Suspense>
    </main>
  );
}