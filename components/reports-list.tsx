"use client";

import { pb } from "@/lib/pocketbase";
import { capitalize, type ReportRecord, type Status } from "@/lib/reports";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_VARIANT: Record<Status, "secondary" | "default" | "outline"> = {
  nowe: "secondary",
  "w realizacji": "default",
  zamknięte: "outline",
};

type Props = {
  reports: ReportRecord[];
  loading: boolean;
  error: string | null;
};

export function ReportsList({ reports, loading, error }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Twoje zgłoszenia</CardTitle>
        <CardDescription>
          Tutaj widzisz tylko zgłoszenia dodane przez siebie i ich status.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Ładowanie...</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nie masz jeszcze żadnych zgłoszeń.
          </p>
        )}

        {reports.map((report) => (
          <div
            key={report.id}
            className="flex gap-3 rounded-lg border p-3"
          >
            {report.image && (
              <a
                href={pb.files.getURL(report, report.image)}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pb.files.getURL(report, report.image, {
                    thumb: "200x200",
                  })}
                  alt={`Zdjęcie: ${report.title}`}
                  className="h-20 w-20 rounded-md object-cover"
                />
              </a>
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-tight">{report.title}</p>
                <Badge variant={STATUS_VARIANT[report.status] ?? "outline"}>
                  {capitalize(report.status)}
                </Badge>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">
                {report.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">Sala {report.room}</Badge>
                <Badge variant="outline">{capitalize(report.category)}</Badge>
                <Badge
                  variant={
                    report.priority === "wysoki" ? "destructive" : "outline"
                  }
                >
                  Priorytet: {report.priority}
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(report.created).toLocaleString("pl-PL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}