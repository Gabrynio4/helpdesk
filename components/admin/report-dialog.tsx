"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { pb } from "@/lib/pocketbase";
import { STATUSES, type ReportRecord, type Status } from "@/lib/reports";
import { PriorityBadge, StatusBadge } from "@/components/admin/report-badges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  report: ReportRecord;
  onClose: () => void;
  onSaved: () => void;
};

export function ReportDialog({ report, onClose, onSaved }: Props) {
  const [status, setStatus] = useState<Status>(report.status);
  const [comment, setComment] = useState(report.admin_comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pole image może być pojedynczym plikiem lub listą (zależnie od ustawień pola)
  const imageName = Array.isArray(report.image) ? report.image[0] : report.image;
  const imageUrl = imageName ? pb.files.getURL(report, imageName) : null;

  const author =
    report.expand?.author?.name || report.expand?.author?.email || "nieznany";

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await pb.collection("reports").update(report.id, {
        status,
        admin_comment: comment,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Nie udało się zapisać zmian. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>
            Zgłoszone {new Date(report.created).toLocaleString("pl-PL")} przez {author}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Sala {report.room}</Badge>
            <Badge variant="outline">{report.category}</Badge>
            <PriorityBadge value={report.priority} />
            <StatusBadge value={report.status} />
          </div>

          <p className="whitespace-pre-wrap text-sm">{report.description}</p>

          {imageUrl && (
            <a href={imageUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pb.files.getURL(report, imageName, { thumb: "600x0" })}
                alt={`Zdjęcie do zgłoszenia: ${report.title}`}
                className="max-h-64 w-full rounded-md border object-contain"
              />
            </a>
          )}

          <div className="grid gap-2">
            <Label htmlFor="report-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger id="report-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="report-comment">Komentarz</Label>
            <Textarea
              id="report-comment"
              rows={4}
              placeholder="Np. zamówiono część, technik będzie w czwartek..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}