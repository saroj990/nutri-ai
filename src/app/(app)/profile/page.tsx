"use client";

import { AppShell } from "@/components/shared/app-shell";
import { ProfileForm } from "@/features/profile/profile-form";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" description="Your personal information">
      <ProfileForm />
    </AppShell>
  );
}
