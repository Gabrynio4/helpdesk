import { UserHeader } from "@/components/user-header";
import { UserReports } from "@/components/user-reports";

export const metadata = {
  title: "Panel użytkownika",
};

export default function UserPage() {
  return (
    <div className="min-h-svh">
      <UserHeader />
      <main className="mx-auto w-full max-w-6xl p-6">
        <h1 className="mb-6 text-2xl font-semibold">Zgłoszenia usterek</h1>
        <UserReports />
      </main>
    </div>
  );
}