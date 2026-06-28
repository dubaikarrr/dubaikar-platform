import Link from "next/link";
import type { Metadata } from "next";
import { Star, MapPinned, ShieldAlert } from "lucide-react";
import { listBookmarks } from "@/lib/actions/bookmarks";
import { AREAS } from "@/lib/map/areas";
import { formatAED, formatINR, aedToInr } from "@/lib/currency";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { HousingHelpForm } from "@/components/housing/help-form";

export const metadata: Metadata = { title: "Housing" };

export default async function HousingPage() {
  const bookmarks = await listBookmarks("area");
  const shortlisted = bookmarks
    .map((b) => AREAS.find((a) => a.slug === b.ref_key))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text">Housing</h1>
        <p className="text-sm text-text-muted">
          Rent benchmarks across Indian-friendly areas, your shortlist, and hands-on help finding a verified place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Shortlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-warning" /> Your shortlisted areas</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {shortlisted.length ? (
                shortlisted.map((a) => (
                  <Link key={a.slug} href="/app/map" className="flex items-center justify-between rounded-[var(--radius-control)] border border-border p-3 text-sm hover:bg-surface-2">
                    <span>
                      <span className="block font-medium text-text">{a.name}</span>
                      <span className="block text-xs text-text-muted">{a.vibe}</span>
                    </span>
                    <span className="text-right text-xs text-text-subtle">
                      1BHK {formatAED(a.rent.oneBhk)}/mo<br />≈ {formatINR(aedToInr(a.rent.oneBhk))}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-start gap-2 text-sm text-text-muted">
                  <p>No areas shortlisted yet. Explore the map and star the areas you like, they&apos;ll show up here and in your accommodation request.</p>
                  <ButtonLink href="/app/map" variant="secondary" size="sm"><MapPinned className="h-4 w-4" /> Explore Dubai map</ButtonLink>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Rent reference */}
          <Card>
            <CardHeader><CardTitle>Rent benchmarks (AED/month)</CardTitle></CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-text-subtle">
                      <th className="py-2 pr-3 font-medium">Area</th>
                      <th className="py-2 pr-3 font-medium">Bed space</th>
                      <th className="py-2 pr-3 font-medium">Studio</th>
                      <th className="py-2 font-medium">1 BHK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...AREAS].sort((a, b) => a.rent.oneBhk - b.rent.oneBhk).map((a) => (
                      <tr key={a.slug} className="border-t border-border">
                        <td className="py-2 pr-3 font-medium text-text">{a.name}</td>
                        <td className="py-2 pr-3 text-text-muted tnum">{formatAED(a.rent.sharing)}</td>
                        <td className="py-2 pr-3 text-text-muted tnum">{formatAED(a.rent.studio)}</td>
                        <td className="py-2 text-text-muted tnum">{formatAED(a.rent.oneBhk)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Help form */}
          <Card>
            <CardHeader><CardTitle>Get help finding a place</CardTitle></CardHeader>
            <CardBody>
              <HousingHelpForm shortlist={shortlisted.map((a) => a.name)} />
            </CardBody>
          </Card>

          {/* Scam checklist */}
          <Card className="border-warning/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-warning" /> Rental scam checklist</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="ml-4 list-disc space-y-1.5 text-sm text-text-muted">
                <li>Never pay before seeing the unit <b>and</b> the landlord&apos;s title deed / agent&apos;s RERA card.</li>
                <li>Below-market rent + &quot;pay now to hold it&quot; = walk away.</li>
                <li>Pay by transfer or cheque with a written receipt, not cash to strangers.</li>
                <li>For bed spaces, visit in person and get terms in writing on WhatsApp.</li>
                <li>For yearly leases, insist on <b>Ejari</b> registration.</li>
              </ul>
              <ButtonLink href="/app/knowledge/ejari-rental-cheques-explained" variant="secondary" size="sm" className="mt-3">
                Read the full renting guide
              </ButtonLink>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
