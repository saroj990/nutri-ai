"use client";

import { AppShell } from "@/components/shared/app-shell";
import { GoalsPanel } from "@/features/goals/goals-panel";

export default function GoalsPage() {
  return (
    <AppShell title="Goals" description="Daily calorie & macro targets">
      <GoalsPanel />
    </AppShell>
  );
}
