"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

import { pb } from "@/lib/pocketbase";
import { PRIORITIES, ROOMS, STATUSES, type ReportRecord } from "@/lib/reports";
import { PriorityBadge, StatusBadge } from "@/components/admin/report-badges";
import { ReportDialog } from "@/components/admin/report-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ALL = "all";

type Filters = { status: string; room: string; priority: string };
const DEFAULT_FILTERS: Filters = { status: ALL, room: ALL, priority: ALL };

// filtrowanie w pb
async function fetchReports(filters: Filters) {
  const parts: string[] = [];
  const params: Record<string, string> = {};

  for (const key of ["status", "room", "priority"] as const) {
    if (filters[key] !== ALL) {
      parts.push(`${key} = {:${key}}`);
      params[key] = filters[key];
    }
  }

  return pb.collection("reports").getFullList<ReportRecord>({
    sort: "-created",
    expand: "author",
    filter: parts.length ? pb.filter(parts.join(" && "), params) : "",
  });
}

function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  allLabel: string;
  placeholder: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v ?? ALL)}
      items={[
        { label: allLabel, value: ALL },
        ...options.map((o) => ({ label: o, value: o })),
      ]}
    >
      <SelectTrigger className="w-full sm:w-[190px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ReportsTable() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReportRecord | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchReports(filters)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("Nie udało się pobrać zgłoszeń. Sprawdź połączenie i reguły API kolekcji reports.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, reloadKey]);

  const filtersActive = Object.values(filters).some((v) => v !== ALL);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterSelect
          value={filters.status}
          onChange={(status) => setFilters((f) => ({ ...f, status }))}
          options={STATUSES}
          allLabel="Wszystkie statusy"
          placeholder="Status"
        />
        <FilterSelect
          value={filters.room}
          onChange={(room) => setFilters((f) => ({ ...f, room }))}
          options={ROOMS}
          allLabel="Wszystkie sale"
          placeholder="Sala"
        />
        <FilterSelect
          value={filters.priority}
          onChange={(priority) => setFilters((f) => ({ ...f, priority }))}
          options={PRIORITIES}
          allLabel="Wszystkie priorytety"
          placeholder="Priorytet"
        />
        {filtersActive && (
          <Button variant="ghost" onClick={() => setFilters(DEFAULT_FILTERS)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Wyczyść filtry
          </Button>
        )}
        <p className="text-sm text-muted-foreground sm:ml-auto">
          {loading ? "Ładowanie..." : `Liczba zgłoszeń: ${reports.length}`}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tytuł</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Priorytet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Brak zgłoszeń spełniających kryteria.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <TableCell className="whitespace-nowrap">
                    {new Date(r.created).toLocaleDateString("pl-PL")}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate font-medium">
                    {r.title}
                  </TableCell>
                  <TableCell>{r.room}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>
                    <PriorityBadge value={r.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={r.status} />
                  </TableCell>
                  <TableCell>
                    {r.expand?.author?.name || r.expand?.author?.email || "–"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Szczegóły
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <ReportDialog
          key={selected.id}
          report={selected}
          onClose={() => setSelected(null)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}