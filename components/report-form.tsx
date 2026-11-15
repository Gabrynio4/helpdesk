"use client";

import { useState } from "react";
import { ClientResponseError } from "pocketbase";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { pb } from "@/lib/pocketbase";
import {
  CATEGORIES,
  PRIORITIES,
  ROOMS,
  capitalize,
  validateImage,
  type ReportRecord,
} from "@/lib/reports";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const roomItems = ROOMS.map((r) => ({ value: r, label: `Sala ${r}` }));
const categoryItems = CATEGORIES.map((c) => ({ value: c, label: capitalize(c) }));
const priorityItems = PRIORITIES.map((p) => ({ value: p, label: capitalize(p) }));

type Props = {
  onCreated: (report: ReportRecord) => void;
};

export function ReportForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>("średni");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0); // do czyszczenia pola pliku

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }
    const problem = validateImage(selected);
    if (problem) {
      setError(problem);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setRoom(null);
    setCategory(null);
    setPriority("średni");
    setFile(null);
    setFileInputKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const authorId = pb.authStore.record?.id;
    if (!authorId) {
      setError("Sesja wygasła. Zaloguj się ponownie.");
      return;
    }
    if (!room || !category || !priority) {
      setError("Wybierz salę, kategorię i priorytet.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("room", room);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("status", "nowe"); // nowe zgłoszenie zawsze startuje jako "nowe"
      formData.append("author", authorId);
      if (file) formData.append("image", file);

      const record = await pb
        .collection("reports")
        .create<ReportRecord>(formData);

      onCreated(record);
      resetForm();
      setSuccess(true);
    } catch (err) {
      if (err instanceof ClientResponseError) {
        if (err.status === 0) {
          setError("Nie można połączyć się z serwerem. Spróbuj ponownie.");
        } else if (err.response?.data?.image) {
          setError("Zdjęcie nie spełnia wymagań (tylko obraz, maks. 5 MB).");
        } else {
          setError("Nie udało się dodać zgłoszenia. Sprawdź dane i spróbuj ponownie.");
        }
      } else {
        setError("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nowe zgłoszenie</CardTitle>
        <CardDescription>Opisz usterkę, którą chcesz zgłosić.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Zgłoszenie zostało dodane.</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              required
              maxLength={120}
              disabled={loading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              required
              rows={4}
              maxLength={2000}
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="room">Sala</Label>
              <Select
                items={roomItems}
                value={room}
                onValueChange={setRoom}
                disabled={loading}
              >
                <SelectTrigger id="room" className="w-full">
                  <SelectValue placeholder="Wybierz salę" />
                </SelectTrigger>
                <SelectContent>
                  {roomItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priorytet</Label>
              <Select
                items={priorityItems}
                value={priority}
                onValueChange={setPriority}
                disabled={loading}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Wybierz priorytet" />
                </SelectTrigger>
                <SelectContent>
                  {priorityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kategoria</Label>
            <Select
              items={categoryItems}
              value={category}
              onValueChange={setCategory}
              disabled={loading}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Zdjęcie usterki (opcjonalnie)</Label>
            <Input
              key={fileInputKey}
              id="image"
              type="file"
              accept="image/*"
              disabled={loading}
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Jeden plik graficzny, maksymalnie 5 MB.
            </p>
          </div>
        </CardContent>

        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Wysyłanie..." : "Wyślij zgłoszenie"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}