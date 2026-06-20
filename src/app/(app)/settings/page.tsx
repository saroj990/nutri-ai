"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/stores/use-profile-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { ChevronRight, Target, User, Droplets, Scale, Trophy, FileText, Utensils, LogOut } from "lucide-react";
import { GOAL_OPTIONS } from "@/features/profile/constants";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const links = [
    {
      href: "/profile",
      icon: User,
      title: "Profile",
      description: profile?.name
        ? `Signed in as ${profile.name}`
        : "Manage your personal info",
    },
    {
      href: "/goals",
      icon: Target,
      title: "Goals & Plan",
      description: profile
        ? `${profile.dailyCalories} kcal · ${GOAL_OPTIONS.find((g) => g.value === profile.goalType)?.label ?? "Custom"}`
        : "Calorie and macro targets",
    },
    {
      href: "/plan",
      icon: Utensils,
      title: "My Plan",
      description: "Your personalized diet chart",
    },
    {
      href: "/water",
      icon: Droplets,
      title: "Water",
      description: "Hydration tracking and quick-add",
    },
    {
      href: "/weight",
      icon: Scale,
      title: "Weight",
      description: "Log weight and view trends",
    },
    {
      href: "/achievements",
      icon: Trophy,
      title: "Achievements",
      description: "XP, levels, and badges",
    },
    {
      href: "/reports",
      icon: FileText,
      title: "Reports",
      description: "Daily, weekly, and monthly summaries",
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.replace("/login");
  };

  return (
    <AppShell title="Settings" description="Preferences & data">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Profile and nutrition goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-0 pb-2">
            {links.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Local account</CardTitle>
            <CardDescription>
              {session?.email ?? "Signed in on this device"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">App</CardTitle>
            <CardDescription>More options coming in future phases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Theme, reminders, and import/export will be available in Phase 7.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
