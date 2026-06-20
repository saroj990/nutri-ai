"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Apple,
  BarChart3,
  Settings,
  Plus,
  Droplets,
  Scale,
  Trophy,
  FileText,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, TRACKING_NAV_ITEMS, ENGAGEMENT_NAV_ITEMS } from "@/lib/constants";

const ICONS = {
  LayoutDashboard,
  Plus,
  Apple,
  BarChart3,
  Settings,
  Droplets,
  Scale,
  Trophy,
  FileText,
  Target,
} as const;

export function SideNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) {
    return null;
  }

  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card/50"
      aria-label="Sidebar navigation"
    >
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">N</span>
        </div>
        <span className="text-lg font-semibold">NutriAI</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
        <div className="my-2 border-t" />
        <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tracking
        </p>
        {TRACKING_NAV_ITEMS.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
        <div className="my-2 border-t" />
        <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Engagement
        </p>
        {ENGAGEMENT_NAV_ITEMS.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
