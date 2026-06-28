import { Card, CardBody } from "@/components/ui/card";

/** Shown on auth pages before Supabase env is configured (docs/SETUP.md). */
export function SetupNeeded() {
  return (
    <Card>
      <CardBody className="space-y-2">
        <h2 className="text-text">Almost there</h2>
        <p className="text-sm text-text-muted">
          Sign-in isn&apos;t available yet because Supabase hasn&apos;t been
          connected. Add your keys to <code>.env.local</code> and restart, 
          see <code>docs/SETUP.md</code>.
        </p>
      </CardBody>
    </Card>
  );
}
