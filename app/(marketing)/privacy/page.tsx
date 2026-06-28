import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Dubaikar collects, stores, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-text">Privacy policy</h1>
      <p className="mt-2 text-sm text-text-subtle">Last updated June 2026.</p>

      <div className="mt-8 space-y-6 text-text-muted">
        <section>
          <h2 className="text-text">What we collect</h2>
          <p className="mt-2 leading-7">
            When you create an account we store your name, email, and phone, plus
            the details you choose to add: your move stage, target salary, visa
            status, industry, budgets, and any CVs or documents you upload.
          </p>
        </section>
        <section>
          <h2 className="text-text">How it&apos;s protected</h2>
          <p className="mt-2 leading-7">
            Your personal data is private by default. Database access is protected
            with row-level security so only you can read your own records.
            Uploaded files are stored in private buckets and served through
            short-lived signed links scoped to you.
          </p>
        </section>
        <section>
          <h2 className="text-text">How it&apos;s used</h2>
          <p className="mt-2 leading-7">
            We use your data to personalize your roadmap and tools. When you ask
            for help (e.g. visa or accommodation assistance) we share the relevant
            details with our team to follow up. We never sell your data.
          </p>
        </section>
        <section>
          <h2 className="text-text">Your choices</h2>
          <p className="mt-2 leading-7">
            You can edit your profile any time in settings, and request deletion of
            your account and data by contacting us.
          </p>
        </section>
      </div>
    </div>
  );
}
