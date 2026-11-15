"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { pb, type UserRecord } from "@/lib/pocketbase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserHeader() {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    setUser(pb.authStore.record as UserRecord | null);
    // onChange zwraca funkcję odsubskrybowania
    return pb.authStore.onChange((_token, record) => {
      setUser(record as UserRecord | null);
    });
  }, []);

  function handleLogout() {
    pb.authStore.clear(); // czyści też ciasteczko
    router.replace("/login");
    router.refresh();
  }

  const label = user?.name || user?.email || "";
  const initials = label.slice(0, 2).toUpperCase();
  const avatarUrl =
    user && user.avatar
      ? pb.files.getURL(user, user.avatar, { thumb: "100x100" })
      : undefined;

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={label} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {user?.role === "admin" ? "Administrator" : "Użytkownik"}
          </p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Wyloguj się
      </Button>
    </header>
  );
}