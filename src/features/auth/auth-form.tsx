"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/domain/schemas/auth.schema";
import { useAuthStore } from "@/stores/use-auth-store";
import { cn } from "@/lib/utils";

export function AuthForm() {
  const router = useRouter();
  const hasAccount = useAuthStore((s) => s.hasAccount);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    setMode(hasAccount ? "login" : "register");
  }, [hasAccount]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      router.replace("/");
    } catch {
      toast.error("Login failed");
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await register(data.email, data.password);
      toast.success("Account created!");
      router.replace("/onboarding");
    } catch {
      toast.error("Could not create account");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          disabled={!hasAccount}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "login"
              ? "bg-background shadow-sm"
              : "text-muted-foreground",
            !hasAccount && "cursor-not-allowed opacity-50",
          )}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === "register"
              ? "bg-background shadow-sm"
              : "text-muted-foreground",
          )}
        >
          Create account
        </button>
      </div>

      {mode === "login" ? (
        <Card>
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Your data stays on this device — no cloud account needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                label="Email"
                htmlFor="login-email"
                error={loginForm.formState.errors.email?.message}
              >
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  {...loginForm.register("email")}
                />
              </FormField>
              <FormField
                label="Password"
                htmlFor="login-password"
                error={loginForm.formState.errors.password?.message}
              >
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Log in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create your local account</CardTitle>
            <CardDescription>
              One account per device. Used to lock your nutrition data locally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <FormField
                label="Email"
                htmlFor="register-email"
                error={registerForm.formState.errors.email?.message}
              >
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  {...registerForm.register("email")}
                />
              </FormField>
              <FormField
                label="Password"
                htmlFor="register-password"
                error={registerForm.formState.errors.password?.message}
              >
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register("password")}
                />
              </FormField>
              <FormField
                label="Confirm password"
                htmlFor="register-confirm"
                error={registerForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register("confirmPassword")}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
