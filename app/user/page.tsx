import { UserHeader } from "@/components/user-header";

export const metadata = {
  title: "Panel użytkownika",
};

export default function UserPage() {
  return (
    <div className="min-h-svh">
      <UserHeader />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Panel użytkownika</h1>
        <p className="mt-2 text-muted-foreground">
          Tu umieść widoki dla zwykłych użytkowników.
        </p>
      </main>
    </div>
  );
}