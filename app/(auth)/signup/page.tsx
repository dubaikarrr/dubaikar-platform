import { redirect } from "next/navigation";

// Public signups are disabled, access is invite-only via Google. Anyone
// hitting /signup is sent to the sign-in page.
export default function SignupPage() {
  redirect("/login");
}
