import { Card } from "@/components/ui/card";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface TotalCardProps {
  totalAed: number;
  oneTimeAed?: number;
  monthlyAed?: number;
  bufferAed?: number;
  className?: string;
  children?: React.ReactNode;
}

/** Sticky cost summary used in the budget tool, AED + INR, broken down. */
export function TotalCard({
  totalAed,
  oneTimeAed,
  monthlyAed,
  bufferAed,
  className,
  children,
}: TotalCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm text-text-muted">Estimated total</p>
      <p className="mt-1 text-3xl font-medium text-text">
        {formatAED(totalAed)}
      </p>
      <p className="text-sm text-text-subtle">≈ {formatINR(aedToInr(totalAed))}</p>

      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {oneTimeAed !== undefined && (
          <Row label="One-time" aed={oneTimeAed} />
        )}
        {monthlyAed !== undefined && (
          <Row label="Monthly" aed={monthlyAed} suffix="/mo" />
        )}
        {bufferAed !== undefined && (
          <Row label="Recommended buffer" aed={bufferAed} />
        )}
      </dl>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}

function Row({
  label,
  aed,
  suffix,
}: {
  label: string;
  aed: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-right">
        <span className="font-medium text-text">
          {formatAED(aed)}
          {suffix}
        </span>{" "}
        <span className="text-xs text-text-subtle">
          ≈ {formatINR(aedToInr(aed))}
        </span>
      </dd>
    </div>
  );
}
