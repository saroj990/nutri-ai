"use client";

import { OnboardingWizard } from "@/features/profile/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-8 md:max-w-2xl lg:max-w-3xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          N
        </div>
        <h1 className="text-2xl font-bold">Welcome to NutriAI</h1>
        <p className="mt-2 text-muted-foreground">
          Answer a few questions and we&apos;ll build your personal diet plan
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
