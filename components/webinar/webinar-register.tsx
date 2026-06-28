"use client";

import { useState } from "react";
import Script from "next/script";
import { CheckCircle2, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import { WEBINAR } from "@/lib/webinar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

/* Razorpay Checkout is injected on the window by the CDN script. */
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (r: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};
type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => { open: () => void };
  }
}

type Status = "idle" | "loading" | "paying" | "success" | "soon" | "error";

export function WebinarRegister() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "", profession: "", experience: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");

    const res = await fetch("/api/webinar/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.paymentsDisabled) {
        setStatus("soon");
        setMessage(data.error);
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
      return;
    }

    if (!window.Razorpay) {
      setStatus("error");
      setMessage("Payment is still loading, please try again in a moment.");
      return;
    }

    setStatus("paying");
    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: "Dubaikar",
      description: WEBINAR.title,
      prefill: { name: form.full_name, email: form.email, contact: form.phone },
      theme: { color: "#FF6B35" },
      modal: { ondismiss: () => setStatus("idle") },
      handler: async (r) => {
        setStatus("loading");
        const v = await fetch("/api/webinar/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...r, registrationId: data.registrationId }),
        });
        const vd = await v.json();
        if (v.ok && vd.ok) {
          setWhatsapp(vd.whatsappUrl ?? null);
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(vd.error ?? "We couldn't verify your payment. If money was deducted, contact us.");
        }
      },
    });
    rzp.open();
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-4 text-text">You&apos;re in! 🎉</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
          Your spot is confirmed. Join the WhatsApp group now, we&apos;ll also email you the
          webinar joining link before the session.
        </p>
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-primary btn-lg mt-5">
            <MessageCircle className="h-5 w-5" /> Join the WhatsApp group
          </a>
        ) : (
          <p className="mt-5 text-sm text-text-subtle">
            We&apos;ll send your WhatsApp group invite by email shortly.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card sm:p-7" id="register">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />

      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="text-text">Reserve your seat</h3>
        <span className="text-2xl font-semibold text-brand">₹{WEBINAR.priceInr}</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Full name" htmlFor="w-name">
          <Input id="w-name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" htmlFor="w-email">
            <Input id="w-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
          </Field>
          <Field label="WhatsApp number" htmlFor="w-phone">
            <Input id="w-phone" required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Current city" htmlFor="w-city">
            <Input id="w-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Pune" />
          </Field>
          <Field label="Experience" htmlFor="w-exp">
            <Select id="w-exp" value={form.experience} onChange={(e) => set("experience", e.target.value)}>
              <option value="">Select…</option>
              <option value="student">Student / fresher</option>
              <option value="0-3">0–3 years</option>
              <option value="3-7">3–7 years</option>
              <option value="7+">7+ years</option>
            </Select>
          </Field>
        </div>
        <Field label="Profession / field" htmlFor="w-prof">
          <Input id="w-prof" value={form.profession} onChange={(e) => set("profession", e.target.value)} placeholder="e.g. Accountant, Software Engineer" />
        </Field>

        {message ? (
          <p className={status === "soon" ? "rounded-[var(--radius-control)] bg-info-soft px-3 py-2 text-sm text-info" : "text-sm text-danger"}>
            {message}
          </p>
        ) : null}

        {status !== "soon" ? (
          <Button type="submit" size="lg" block disabled={status === "loading" || status === "paying"}>
            {status === "loading" || status === "paying" ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Please wait…</>
            ) : (
              <>Pay ₹{WEBINAR.priceInr} & register</>
            )}
          </Button>
        ) : null}

        <p className="flex items-center justify-center gap-1.5 text-xs text-text-subtle">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure payment via Razorpay
        </p>
      </form>
      {!scriptReady ? <span className="sr-only">Loading payment…</span> : null}
    </div>
  );
}
