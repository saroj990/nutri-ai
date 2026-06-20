import { BottomNav } from "@/components/shared/bottom-nav";
import { SideNav } from "@/components/shared/side-nav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Full-width content without max-width constraint (e.g. foods master-detail) */
  wide?: boolean;
  actions?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  description,
  wide = false,
  actions,
}: AppShellProps) {
  return (
    <div className="flex min-h-full">
      <SideNav />
      <div className="flex min-h-full flex-1 flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div
            className={
              wide
                ? "flex h-14 items-center justify-between px-4 md:px-6 lg:px-8"
                : "mx-auto flex h-14 max-w-lg items-center justify-between px-4 md:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
            }
          >
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">N</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none">
                  {title ?? "NutriAI"}
                </h1>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base font-semibold leading-none">
                {title ?? "NutriAI"}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        <main
          id="main-content"
          className={
            wide
              ? "flex-1 px-4 py-4 pb-24 animate-fade-in md:px-6 md:py-6 lg:pb-8 lg:px-8"
              : "mx-auto w-full max-w-lg flex-1 px-4 py-6 pb-24 animate-fade-in md:max-w-3xl md:px-6 lg:max-w-5xl lg:pb-8 xl:max-w-6xl"
          }
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
