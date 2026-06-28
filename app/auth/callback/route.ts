import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth/allowlist";

/** Google OAuth code exchange, allowlist gate, then route into the app. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") ?? "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Invite-only: reject emails that aren't on the allowlist.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!(await isEmailAllowed(user?.email))) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/members-only`);
      }
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
