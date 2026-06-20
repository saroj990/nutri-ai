"use client";

import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          N
        </div>
        <h1 className="text-2xl font-bold">NutriAI</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Local login — your data never leaves this browser
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
