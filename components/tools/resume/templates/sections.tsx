import type { ResumeData } from "@/lib/database.types";

/* ---------------- helpers ---------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtMonth(v?: string) {
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})$/.exec(v);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : v;
}
export function fmtRange(start?: string, end?: string, current?: boolean) {
  return [fmtMonth(start), current ? "Present" : fmtMonth(end)].filter(Boolean).join(" – ");
}
function profPct(p?: string): number | null {
  if (!p) return null;
  const s = p.toLowerCase();
  if (s.includes("native") || s.includes("fluent")) return 100;
  if (s.includes("professional") || s.includes("advanced")) return 85;
  if (s.includes("intermediate")) return 60;
  if (s.includes("basic") || s.includes("beginner")) return 30;
  return 70;
}

export type HeadingVariant = "underline" | "bar" | "rule" | "side" | "block" | "plain";

export function Heading({ title, variant }: { title: string; variant: HeadingVariant }) {
  return (
    <div className={`cv-h2 cv-h2--${variant}`}>
      {variant === "block" ? (
        <span className="cv-h2-ico" style={{ width: 10, height: 10, borderRadius: 3, background: "var(--rc)", display: "inline-block" }} />
      ) : null}
      {title}
    </div>
  );
}

export function Rich({ html }: { html?: string }) {
  if (!html) return null;
  return <div className="cv-rt" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Photo({ src, shape, size = 64 }: { src?: string; shape?: string; size?: number }) {
  if (!src) return null;
  const radius = shape === "square" ? 4 : shape === "rect" ? 8 : "50%";
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cv-photo" src={src} alt="" style={{ width: size, height: size, borderRadius: radius }} />;
}

export function ContactInline({ data, showUae = true }: { data: ResumeData; showUae?: boolean }) {
  const p = data.personal;
  const items = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
  const uae = showUae
    ? [p.nationality, p.visaStatus, p.noticePeriod && `Notice: ${p.noticePeriod}`].filter(Boolean)
    : [];
  return (
    <>
      <div className="cv-contact">
        {items.map((x, i) => <span key={i}>{x}</span>)}
      </div>
      {uae.length ? <div className="cv-uae">{uae.join("  ·  ")}</div> : null}
    </>
  );
}

export function SkillChips({ skills }: { skills: string[] }) {
  return <div className="cv-chips">{skills.map((s, i) => <span key={i} className="cv-chip">{s}</span>)}</div>;
}

export function LangBars({ data }: { data: ResumeData }) {
  const langs = data.languages ?? [];
  return (
    <div className="cv-langs">
      {langs.map((l, i) => {
        const pct = profPct(l.proficiency);
        return (
          <div key={i}>
            <div className="cv-lang-top"><span className="cv-lang-name">{l.name}</span>{l.proficiency ? <span>{l.proficiency}</span> : null}</div>
            {pct != null ? <div className="cv-bar"><span style={{ width: `${pct}%` }} /></div> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- generic section renderer (single-column templates) ---------------- */
export function renderSection(
  key: string,
  data: ResumeData,
  ctx: { heading: HeadingVariant; eduTable?: boolean; timeline?: boolean; skillsInline?: boolean },
): React.ReactNode {
  const H = (title: string) => <Heading title={title} variant={ctx.heading} />;

  switch (key) {
    case "summary":
      return data.personal.summaryHtml ? (
        <section className="cv-section" key={key}>{H("Professional summary")}<Rich html={data.personal.summaryHtml} /></section>
      ) : null;

    case "experience":
      if (!data.experience.length) return null;
      return (
        <section className="cv-section" key={key}>
          {H("Work experience")}
          <div className={ctx.timeline ? "cv-timeline" : undefined}>
            {data.experience.map((x, i) => (
              <div className={ctx.timeline ? "cv-tl-item" : "cv-entry"} key={i}>
                <div className="cv-entry-top"><span className="cv-entry-title">{x.role}</span><span className="cv-meta">{fmtRange(x.start, x.end, x.current)}</span></div>
                <div className="cv-entry-sub"><span className="cv-entry-org">{x.company}</span>{x.location ? <span className="cv-meta">{x.location}</span> : null}</div>
                <Rich html={x.descriptionHtml} />
              </div>
            ))}
          </div>
        </section>
      );

    case "education":
      if (!data.education.length) return null;
      if (ctx.eduTable) {
        return (
          <section className="cv-section" key={key}>
            {H("Education")}
            <table className="cv-edutable">
              <thead><tr><th>Course</th><th>Year</th><th>Institution</th><th>Score</th></tr></thead>
              <tbody>
                {data.education.map((e, i) => (
                  <tr key={i}><td>{[e.degree, e.field].filter(Boolean).join(", ")}</td><td>{e.year || fmtMonth(e.start)}</td><td>{e.institution}</td><td>{e.grade || "-"}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      }
      return (
        <section className="cv-section" key={key}>
          {H("Education")}
          {data.education.map((e, i) => (
            <div className="cv-entry" key={i}>
              <div className="cv-entry-top"><span className="cv-entry-title">{[e.degree, e.field].filter(Boolean).join(", ")}</span><span className="cv-meta">{e.year || fmtMonth(e.start)}</span></div>
              <div className="cv-entry-sub"><span className="cv-entry-org">{e.institution}</span>{e.grade ? <span className="cv-meta">{e.grade}</span> : null}</div>
            </div>
          ))}
        </section>
      );

    case "skills":
      if (!data.skills.length && !data.softSkills?.length) return null;
      return (
        <section className="cv-section" key={key}>
          {H("Skills")}
          {ctx.skillsInline ? (
            <>
              {data.skills.length ? <p>{data.skills.join("  ·  ")}</p> : null}
              {data.softSkills?.length ? <p style={{ color: "#555" }}>{data.softSkills.join("  ·  ")}</p> : null}
            </>
          ) : (
            <>
              {data.skills.length ? <SkillChips skills={data.skills} /> : null}
              {data.softSkills?.length ? <div style={{ marginTop: 6 }}><SkillChips skills={data.softSkills} /></div> : null}
            </>
          )}
        </section>
      );

    case "projects":
      return data.projects?.length ? (
        <section className="cv-section" key={key}>
          {H("Projects")}
          {data.projects.map((p, i) => (
            <div className="cv-entry" key={i}>
              <div className="cv-entry-top"><span className="cv-entry-title">{p.name}</span>{p.link ? <span className="cv-meta">{p.link}</span> : null}</div>
              <Rich html={p.descriptionHtml} />
            </div>
          ))}
        </section>
      ) : null;

    case "certifications":
      return data.certifications?.length ? (
        <section className="cv-section" key={key}>
          {H("Certifications")}
          {data.certifications.map((c, i) => (
            <div className="cv-row" key={i}><span><b>{c.name}</b>{c.issuer ? `, ${c.issuer}` : ""}</span><span className="cv-meta">{c.date}</span></div>
          ))}
        </section>
      ) : null;

    case "awards":
      return data.awards?.length ? (
        <section className="cv-section" key={key}>
          {H("Awards")}
          {data.awards.map((a, i) => (
            <div className="cv-entry" key={i}>
              <div className="cv-entry-top"><span className="cv-entry-title">{a.title}</span><span className="cv-meta">{a.date}</span></div>
              {a.issuer ? <div className="cv-entry-sub"><span className="cv-entry-org">{a.issuer}</span></div> : null}
              <Rich html={a.descriptionHtml} />
            </div>
          ))}
        </section>
      ) : null;

    case "languages":
      return data.languages?.length ? (
        <section className="cv-section" key={key}>{H("Languages")}<LangBars data={data} /></section>
      ) : null;

    case "references":
      if (!data.references || data.references.mode === "hidden") return null;
      return (
        <section className="cv-section" key={key}>
          {H("References")}
          {data.references.mode === "on-request" ? <div style={{ fontSize: 11 }}>Available upon request</div> : (
            data.references.items?.map((r, i) => (
              <div className="cv-row" key={i}><span><b>{r.name}</b>{r.title ? `, ${r.title}` : ""}{r.company ? `, ${r.company}` : ""}</span><span className="cv-meta">{r.contact}</span></div>
            ))
          )}
        </section>
      );

    default: {
      const custom = data.customSections?.find((c) => c.id === key);
      return custom?.itemsHtml ? (
        <section className="cv-section" key={key}>{H(custom.title)}<Rich html={custom.itemsHtml} /></section>
      ) : null;
    }
  }
}

/** Section keys in display order, excluding hidden ones, filtered to a set. */
export function orderedKeys(data: ResumeData, only?: string[]): string[] {
  const order = data.layout?.order ?? [];
  const hidden = new Set(data.layout?.hidden ?? []);
  return order.filter((k) => !hidden.has(k) && (!only || only.includes(k)));
}
