import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { SetupNeeded } from "@/components/auth/setup-needed";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

// Renders the Supabase client, skip static prerender (needs runtime env).
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text">Welcome back</h1>
        <p className="text-sm text-text-muted">
          Sign in to continue your move to Dubai.
        </p>
      </div>
      {isSupabaseConfigured() ? (
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      ) : (
        <SetupNeeded />
      )}
    </div>
  );
}
