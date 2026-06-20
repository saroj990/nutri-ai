"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickLogFab() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/log/new")) {
    return null;
  }

  return (
    <Link
      href="/log/new"
      className={cn(
        "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 active:scale-95",
        "bottom-20 right-4 lg:bottom-8 lg:right-8",
      )}
      aria-label="Log a meal"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
