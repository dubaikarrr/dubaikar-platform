"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Lightbulb } from "lucide-react";

interface Card {
  tag: string;
  q: string;
  answer: string;
  tips: string[];
}

const CARDS: Card[] = [
  {
    tag: "Opener",
    q: "Tell me about yourself.",
    answer:
      "Keep it 60 seconds: present role and one strong result, why Dubai specifically, and what you want next. Skip your life story.",
    tips: ["Lead with a number (a result)", "Name Dubai by choice, not chance", "End on the role you want"],
  },
  {
    tag: "Relocation",
    q: "Why do you want to move to Dubai?",
    answer:
      "Tie it to the role and market, not just tax-free salary. Show you understand the UAE business environment and that you're ready to commit.",
    tips: ["Avoid 'only for the money'", "Mention you've researched the market", "Signal long-term intent"],
  },
  {
    tag: "Logistics",
    q: "What's your notice period and visa status?",
    answer:
      "Be precise and honest: exact notice (e.g. 30 days), whether you're on a visit visa or need sponsorship, and your earliest join date.",
    tips: ["Know your real notice period", "Clarify visit visa vs sponsorship", "Give a concrete date"],
  },
  {
    tag: "Money",
    q: "What are your salary expectations?",
    answer:
      "Give a researched AED range, not an INR conversion. Factor housing, transport and that there's no income tax, so judge the net package.",
    tips: ["Quote AED, not converted INR", "Research the band first", "Judge the full package"],
  },
];

export function NotesDemo() {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = CARDS[i];

  function go(d: number) {
    setRevealed(false);
    setI((x) => (x + d + CARDS.length) % CARDS.length);
  }

  return (
    <div>
      <div className="min-h-[230px] rounded-[var(--radius-control)] border border-border bg-white p-5 shadow-sm">
        <span className="inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand">
          {card.tag}
        </span>
        <p className="mt-3 text-lg font-semibold text-slate-900">{card.q}</p>

        {revealed ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-slate-700">{card.answer}</p>
            <div className="rounded-[var(--radius-control)] bg-amber-50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Lightbulb className="h-3.5 w-3.5" /> Quick tips
              </p>
              <ul className="space-y-0.5">
                {card.tips.map((t) => (
                  <li key={t} className="text-xs text-amber-800">· {t}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            <Eye className="h-4 w-4" /> Show the model answer + tips
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => go(-1)} className="btn btn-ghost btn-sm" aria-label="Previous">
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex items-center gap-2">
          {revealed ? (
            <button onClick={() => setRevealed(false)} className="flex items-center gap-1 text-xs text-text-subtle hover:text-text">
              <EyeOff className="h-3.5 w-3.5" /> Hide
            </button>
          ) : null}
          <span className="text-xs text-text-subtle">{i + 1} / {CARDS.length}</span>
        </div>
        <button onClick={() => go(1)} className="btn btn-ghost btn-sm" aria-label="Next">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-text-subtle">
        A taste of the full Dubai-market question bank and notes you get inside.
      </p>
    </div>
  );
}
