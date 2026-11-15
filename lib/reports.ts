import type { RecordModel } from "pocketbase";

// Wartości MUSZĄ być identyczne z tymi w polach select w PocketBase (łącznie z polskimi znakami).
export const ROOMS = ["216", "220", "214"] as const;
export const CATEGORIES = [
  "sprzęt komputerowy",
  "multimedia",
  "instalacje",
  "inne",
] as const;
export const PRIORITIES = ["niski", "średni", "wysoki"] as const;
export const STATUSES = ["nowe", "w realizacji", "zamknięte"] as const;

export type Room = (typeof ROOMS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type ReportRecord = RecordModel & {
  title: string;
  description: string;
  room: Room;
  category: Category;
  priority: Priority;
  status: Status;
  image: string; // nazwa pliku, pusta jeśli brak zdjęcia
  author: string; // id użytkownika
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Dozwolone są tylko pliki graficzne.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Zdjęcie może mieć maksymalnie 5 MB.";
  }
  return null;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}