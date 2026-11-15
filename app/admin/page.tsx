import { UserHeader } from "@/components/user-header";

export const metadata = {
  title: "Panel administratora",
};

export default function AdminPage() {
  return (
    <div className="min-h-svh">
      <UserHeader />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Panel administratora</h1>
        <p className="mt-2 text-muted-foreground">
          Tu umieść widoki dostępne tylko dla administratorów.
        </p>
      </main>
    </div>
  );
}