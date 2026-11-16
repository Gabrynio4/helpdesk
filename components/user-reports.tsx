"use client";

import { useEffect, useState } from "react";

import { pb } from "@/lib/pocketbase";
import type { ReportRecord } from "@/lib/reports";
import { ReportForm } from "@/components/report-form";
import { ReportsList } from "@/components/reports-list";

export function UserReports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const userId = pb.authStore.record?.id;
      if (!userId) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        setLoading(false);
        return;
      }
      try {
        const items = await pb.collection("reports").getFullList<ReportRecord>({
          filter: pb.filter("author = {:id}", { id: userId }),
          sort: "-created",
        });
        setReports(items);
      } catch {
        setError("Nie udało się pobrać zgłoszeń.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <ReportForm onCreated={(r) => setReports((prev) => [r, ...prev])} />
      <ReportsList reports={reports} loading={loading} error={error} />
    </div>
  );
}
