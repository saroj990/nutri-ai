"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { RepositoryProvider } from "@/infrastructure/di/repository-context";
import { AppInitializer } from "@/components/shared/app-initializer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RepositoryProvider>
        <AppInitializer>
          {children}
        </AppInitializer>
        <Toaster richColors position="top-center" />
      </RepositoryProvider>
    </ThemeProvider>
  );
}
