import { Badge } from "@/components/ui/badge";
import type { Priority, Status } from "@/lib/reports";

type Variant = "default" | "secondary" | "destructive" | "outline";

const PRIORITY_VARIANT: Record<Priority, Variant> = {
  niski: "outline",
  średni: "secondary",
  wysoki: "destructive",
};

const STATUS_VARIANT: Record<Status, Variant> = {
  nowe: "default",
  "w realizacji": "secondary",
  zamknięte: "outline",
};

export function PriorityBadge({ value }: { value: Priority }) {
  return <Badge variant={PRIORITY_VARIANT[value] ?? "outline"}>{value}</Badge>;
}

export function StatusBadge({ value }: { value: Status }) {
  return <Badge variant={STATUS_VARIANT[value] ?? "outline"}>{value}</Badge>;
}