import { Construction } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-text">{title}</h1>
      <EmptyState
        icon={<Construction className="h-5 w-5" />}
        title="Coming soon"
        description={description}
        action={<ButtonLink href="/app">Back to dashboard</ButtonLink>}
      />
    </div>
  );
}
