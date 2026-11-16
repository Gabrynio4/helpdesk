import { UserHeader } from "@/components/user-header";
import { ReportsTable } from "@/components/admin/reports-table";

export const metadata = {
  title: "Panel administratora",
};

export default function AdminPage() {
  return (
    <div className="min-h-svh">
      <UserHeader />
      <main className="mx-auto max-w-7xl p-6">
        <h1 className="text-2xl font-semibold">Zgłoszenia</h1>
        <p className="mb-6 mt-1 text-muted-foreground">
          Przeglądaj zgłoszenia, filtruj je, zmieniaj status i dodawaj komentarze.
        </p>
        <ReportsTable />
      </main>
    </div>
  );
}