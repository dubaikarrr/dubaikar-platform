"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/** Google-only, invite-only sign in. */
export function AuthForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/app";
  const errorCode = params.get("error");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode === "not_allowed"
      ? "This Google account isn't on the access list. Access to Dubaikar is invite-only, contact the team to be added."
      : errorCode === "auth"
        ? "Sign-in failed. Please try again."
        : null,
  );

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button className="w-full" onClick={handleGoogle} disabled={busy}>
        {busy ? "Redirecting…" : "Continue with Google"}
      </Button>

      <p className="text-center text-xs text-text-subtle">
        Access is invite-only. Sign in with the Google account you were given
        access with.
      </p>
    </div>
  );
}
