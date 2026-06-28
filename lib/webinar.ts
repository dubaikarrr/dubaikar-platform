/**
 * Webinar config, single source of truth for the landing page + payment.
 * Founders: edit the copy, price, and date here. The price is enforced
 * server-side in the order route, so changing PRICE_INR is all you need.
 */

export const WEBINAR = {
  priceInr: 999,
  currency: "INR" as const,
  title: "Land in Dubai, job-ready",
  subtitle:
    "A live, no-fluff webinar for Indian professionals moving to Dubai, the visa, the money, the job search, and the interview, walked through end to end by CAs who've done it.",
  // Founders: update these before going live.
  dateLabel: "Sunday, 6 July 2026",
  timeLabel: "7:00 PM IST · 5:30 PM Dubai",
  // ISO timestamp for the live countdown (7:00 PM IST = 13:30 UTC).
  startsAt: "2026-07-06T13:30:00Z",
  durationLabel: "90 minutes + live Q&A",
  hostLabel: "Hosted by CAs Sanket & Shivam",

  agenda: [
    "The real cost of moving, visa, flights, deposits, first 2 months",
    "How the Dubai job hunt actually works (and what recruiters look for)",
    "Building a Dubai-ready CV that clears ATS filters",
    "Cracking the interview, common questions, what to say, what not to",
    "Visa, WPS, gratuity & your rights as a new employee",
    "Live Q&A, bring your situation",
  ],

  faqs: [
    {
      q: "Will I get a job after this webinar?",
      a: "No. We do not provide a job guarantee. We make your move easier and your preparation sharper, landing a job depends on your own skills and hard work.",
    },
    {
      q: "How do I get the webinar link?",
      a: "After payment you'll join our WhatsApp group instantly, and we'll personally email you the joining link before the session.",
    },
    {
      q: "Is the session recorded?",
      a: "Yes, registered attendees get access to the recording and the notes shared during the session.",
    },
    {
      q: "What if I can't attend live?",
      a: "Register anyway, you'll get the recording, the interview notes, and the question bank, plus the WhatsApp community.",
    },
  ],
} as const;

/** The four offerings showcased on the landing page. */
export interface WebinarFeature {
  key: string;
  tab: string;
  title: string;
  blurb: string;
  points: string[];
}

export const WEBINAR_FEATURES: WebinarFeature[] = [
  {
    key: "interview",
    tab: "Interview prep",
    title: "Interview questions + notes",
    blurb: "Walk in prepared, not nervous.",
    points: [
      "Curated Dubai-market interview question bank",
      "Ready-to-revise interview notes by domain",
      "What hiring managers in the UAE actually probe for",
      "How to talk about notice period, visa & relocation",
    ],
  },
  {
    key: "resume",
    tab: "Resume + ATS",
    title: "Resume builder + ATS score",
    blurb: "A CV that clears the filters.",
    points: [
      "12 Dubai-ready templates, free PDF download",
      "ATS scoring so your CV isn't auto-rejected",
      "UAE-specific fields, visa status, nationality, notice",
      "JD matcher to tailor your CV to each role",
    ],
  },
  {
    key: "explore",
    tab: "Explore Dubai",
    title: "Dubai map + budget tools",
    blurb: "Know the city before you land.",
    points: [
      "Interactive map: where Indians live, rents, schools",
      "Metro reach, commute times & area comparisons",
      "Move-in budget calculator in AED and ₹",
      "Shortlist areas and plan your first month",
    ],
  },
  {
    key: "community",
    tab: "Community + 1:1",
    title: "Community + expert guidance",
    blurb: "You won't be doing this alone.",
    points: [
      "Private member community, ask, share, connect",
      "Meet others moving the same month as you",
      "1:1 sessions with CAs for your specific situation",
      "Guides on attestation, banking, tax & family visa",
    ],
  },
];

export const WEBINAR_DISCLAIMER =
  "We do not provide a job guarantee. We help make your journey to Dubai easier, getting a job depends on your own skills and hard work.";

/**
 * Where the "Register" buttons send people. The webinar runs on SuperProfile,
 * so paste your SuperProfile event/checkout link into NEXT_PUBLIC_WEBINAR_CHECKOUT_URL.
 * Falls back to "#register" so the page never has a dead button while you set it up.
 */
export const WEBINAR_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_WEBINAR_CHECKOUT_URL || "";
