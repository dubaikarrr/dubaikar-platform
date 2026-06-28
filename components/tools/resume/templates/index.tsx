import type { ResumeData } from "@/lib/database.types";
import { resolveStyle, fontStack, type EffectiveStyle } from "@/lib/resume/theme";
import {
  Heading, Photo, ContactInline, SkillChips, LangBars,
  renderSection, orderedKeys,
} from "@/components/tools/resume/templates/sections";

/* ---------------- root style + sheet class ---------------- */
const DENSITY: Record<string, { padx: string; pady: string; gap: string; fs: string }> = {
  compact: { padx: "26px", pady: "20px", gap: "10px", fs: "12px" },
  normal: { padx: "32px", pady: "26px", gap: "15px", fs: "13px" },
  relaxed: { padx: "38px", pady: "34px", gap: "20px", fs: "13.5px" },
};

function rootStyle(eff: EffectiveStyle): React.CSSProperties {
  const d = DENSITY[eff.density] ?? DENSITY.normal;
  const vars: Record<string, string> = {
    "--rc": eff.accentColor,
    "--rc2": eff.secondaryColor,
    "--cv-lh": String(eff.lineSpacing),
    "--cv-head": fontStack(eff.headingFont),
    "--cv-body": fontStack(eff.bodyFont),
    "--cv-padx": d.padx,
    "--cv-pady": d.pady,
    "--cv-gap": d.gap,
    "--cv-fs": d.fs,
  };
  return vars as React.CSSProperties;
}
function sheetClass(eff: EffectiveStyle, extra = ""): string {
  return [
    "cv-sheet",
    eff.fontType === "serif" ? "cv-serif" : "",
    eff.divider === "none" ? "" : eff.divider === "dotted" ? "cv-div-dotted" : "cv-div-line",
    extra,
  ].filter(Boolean).join(" ");
}

/* ---------------- shared header / body ---------------- */
function HeaderBand({ data, eff, grad }: { data: ResumeData; eff: EffectiveStyle; grad?: boolean }) {
  return (
    <div className={`cv-band${grad ? " cv-band-grad" : ""}`}>
      <Photo src={data.personal.photo} shape={data.personal.photoShape} size={eff.photoSize} />
      <div style={{ flex: 1 }}>
        <h1 className="cv-name">{data.personal.fullName || "Your name"}</h1>
        {data.personal.jobTitle ? <div className="cv-role">{data.personal.jobTitle}</div> : null}
        <ContactInline data={data} showUae={eff.showUae} />
      </div>
    </div>
  );
}
function HeaderPlain({ data, eff, center }: { data: ResumeData; eff: EffectiveStyle; center?: boolean }) {
  return (
    <div className={`cv-pad${center ? " cv-center" : ""}`} style={{ paddingBottom: 6 }}>
      <h1 className="cv-name">{data.personal.fullName || "Your name"}</h1>
      {data.personal.jobTitle ? <div className="cv-role" style={{ color: "#444" }}>{data.personal.jobTitle}</div> : null}
      <ContactInline data={data} showUae={eff.showUae} />
    </div>
  );
}
function Body({ data, eff, timeline, pt }: { data: ResumeData; eff: EffectiveStyle; timeline?: boolean; pt?: number }) {
  return (
    <div className="cv-pad" style={pt != null ? { paddingTop: pt } : undefined}>
      {orderedKeys(data).map((k) => renderSection(k, data, { heading: eff.headingStyle, eduTable: eff.eduStyle === "table", timeline, skillsInline: eff.skillsStyle === "inline" }))}
    </div>
  );
}

/* ---------------- single-column templates ---------------- */
const Corporate = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderBand data={data} eff={eff} />
    <Body data={data} eff={eff} />
  </div>
);
const AccentHeader = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderBand data={data} eff={eff} />
    <Body data={data} eff={eff} />
  </div>
);
const Compact = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderPlain data={data} eff={eff} />
    <Body data={data} eff={eff} pt={4} />
  </div>
);
const Timeline = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderPlain data={data} eff={eff} />
    <Body data={data} eff={eff} timeline pt={4} />
  </div>
);
const Creative = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderBand data={data} eff={eff} grad />
    <Body data={data} eff={eff} />
  </div>
);
const Minimalist = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderPlain data={data} eff={eff} />
    <Body data={data} eff={eff} pt={4} />
  </div>
);
const Executive = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderPlain data={data} eff={eff} center />
    <Body data={data} eff={eff} pt={4} />
  </div>
);
const Classic = ({ data, eff }: TplProps) => (
  <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
    <HeaderPlain data={data} eff={eff} />
    <Body data={data} eff={eff} pt={4} />
  </div>
);

/* ---------------- two-column templates ---------------- */
const SIDE_KEYS = ["skills", "languages", "certifications"];
function Sidebar({ data, eff, variant, right }: { data: ResumeData; eff: EffectiveStyle; variant: "accent" | "grey" | "dark"; right?: boolean }) {
  const p = data.personal;
  const light = variant === "accent" || variant === "dark";
  const sideCls = `cv-side cv-side-${variant}${light ? " cv-side-light" : ""}`;
  const contact = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
  const uae = eff.showUae ? [p.nationality, p.visaStatus, p.noticePeriod && `Notice: ${p.noticePeriod}`].filter(Boolean) : [];
  const showSkills = data.skills.length && !data.layout?.hidden?.includes("skills");
  const showLangs = data.languages?.length && !data.layout?.hidden?.includes("languages");
  const showCerts = data.certifications?.length && !data.layout?.hidden?.includes("certifications");
  const mainKeys = orderedKeys(data).filter((k) => !SIDE_KEYS.includes(k));

  const aside = (
    <aside className={sideCls} key="side">
      {p.photo ? <div style={{ marginBottom: 12 }}><Photo src={p.photo} shape={p.photoShape} size={84} /></div> : null}
      <h1 className="cv-name">{p.fullName || "Your name"}</h1>
      {p.jobTitle ? <div className="cv-role">{p.jobTitle}</div> : null}
      <div className="cv-side-block"><div className="cv-side-contact">{[...contact, ...uae].map((c, i) => <span key={i}>{c}</span>)}</div></div>
      {showSkills ? <div className="cv-side-block"><Heading title="Skills" variant="side" /><SkillChips skills={data.skills} /></div> : null}
      {showLangs ? <div className="cv-side-block"><Heading title="Languages" variant="side" /><LangBars data={data} /></div> : null}
      {showCerts ? (
        <div className="cv-side-block">
          <Heading title="Certifications" variant="side" />
          {data.certifications!.map((c, i) => <div key={i} style={{ fontSize: 10, marginBottom: 3 }}><b>{c.name}</b>{c.issuer ? `, ${c.issuer}` : ""}</div>)}
        </div>
      ) : null}
    </aside>
  );
  const main = (
    <main className="cv-main" key="main">
      {mainKeys.map((k) => renderSection(k, data, { heading: eff.headingStyle, eduTable: eff.eduStyle === "table", skillsInline: eff.skillsStyle === "inline" }))}
    </main>
  );

  return (
    <div className={sheetClass(eff)} style={rootStyle(eff)} id="cv-sheet">
      <div className="cv-split">{right ? [main, aside] : [aside, main]}</div>
    </div>
  );
}
const Modern = ({ data, eff }: TplProps) => <Sidebar data={data} eff={eff} variant="accent" />;
const Cascade = ({ data, eff }: TplProps) => <Sidebar data={data} eff={eff} variant="grey" />;
const DarkSidebar = ({ data, eff }: TplProps) => <Sidebar data={data} eff={eff} variant="dark" />;
const RightRail = ({ data, eff }: TplProps) => <Sidebar data={data} eff={eff} variant="accent" right />;

/* ---------------- registry + switcher ---------------- */
type TplProps = { data: ResumeData; eff: EffectiveStyle };
const REGISTRY: Record<string, (p: TplProps) => React.ReactElement> = {
  corporate: Corporate, accent: AccentHeader, compact: Compact,
  modern: Modern, cascade: Cascade, darksidebar: DarkSidebar, rightrail: RightRail,
  timeline: Timeline, creative: Creative,
  minimalist: Minimalist, executive: Executive, classic: Classic,
  // legacy aliases
  professional: Corporate, minimal: Minimalist, clean: Cascade, fresher: Compact, sidebar: DarkSidebar,
};

export function ResumeDocument({ data, styleOverride }: { data: ResumeData; styleOverride?: ResumeData["style"] }) {
  const eff = resolveStyle(styleOverride ?? data.style);
  const Tpl = REGISTRY[eff.template] ?? Corporate;
  return <Tpl data={data} eff={eff} />;
}
