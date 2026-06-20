"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAllAppData } from "@/services/clear-data.service";

export default function SecretResetPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryKey = params.get("key");
    if (queryKey) {
      setKey(queryKey);
    }
  }, []);

  const handleClear = async () => {
    if (!key.trim()) {
      toast.error("Reset key is required");
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/sys/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      if (!response.ok) {
        toast.error("Invalid reset key");
        setIsClearing(false);
        return;
      }

      await clearAllAppData();
      setDone(true);
      toast.success("All local data cleared");
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch {
      toast.error("Failed to clear data");
      setIsClearing(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Reset local data</CardTitle>
          <CardDescription>
            Clears all IndexedDB data, profile, meals, and your local login.
            This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <p className="text-sm text-muted-foreground">
              Data wiped. Redirecting to login...
            </p>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Reset secret key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={isClearing}
                onClick={() => void handleClear()}
              >
                {isClearing ? "Clearing..." : "Clear all data"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Visit{" "}
                <code className="rounded bg-muted px-1">/sys/reset?key=YOUR_SECRET</code>{" "}
                or set <code className="rounded bg-muted px-1">DATA_RESET_SECRET</code> in{" "}
                <code className="rounded bg-muted px-1">.env.local</code>.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
