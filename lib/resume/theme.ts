import type { ResumeStyle, HeadingStyle, DividerStyle, Density } from "@/lib/database.types";

export type TemplateFamily = "Header band" | "Two-column" | "Timeline & creative" | "Minimal & serif";
export type Sidebar = "accent-left" | "grey-left" | "dark-left" | "accent-right";

export interface TemplateDef {
  key: string;
  label: string;
  family: TemplateFamily;
  columns: "single" | "double";
  sidebar?: Sidebar;
  default: Partial<ResumeStyle>;
}

/** 12 templates, each with a signature theme. */
export const TEMPLATE_DEFS: TemplateDef[] = [
  { key: "corporate", label: "Corporate", family: "Header band", columns: "single",
    default: { accentColor: "#1A1D3E", headingStyle: "bar", headingFont: "Poppins", bodyFont: "Inter", density: "normal", eduStyle: "table" } },
  { key: "accent", label: "Accent Header", family: "Header band", columns: "single",
    default: { accentColor: "#0D9488", headingStyle: "underline", headingFont: "Montserrat", bodyFont: "Source Sans 3", density: "normal" } },
  { key: "compact", label: "Compact", family: "Header band", columns: "single",
    default: { accentColor: "#475569", headingStyle: "rule", headingFont: "Inter", bodyFont: "Inter", density: "compact" } },

  { key: "modern", label: "Modern", family: "Two-column", columns: "double", sidebar: "accent-left",
    default: { accentColor: "#FF6B35", headingStyle: "underline", headingFont: "Poppins", bodyFont: "Inter", density: "normal" } },
  { key: "cascade", label: "Cascade", family: "Two-column", columns: "double", sidebar: "grey-left",
    default: { accentColor: "#2563EB", headingStyle: "underline", headingFont: "Montserrat", bodyFont: "Open Sans", density: "normal" } },
  { key: "darksidebar", label: "Dark Sidebar", family: "Two-column", columns: "double", sidebar: "dark-left",
    default: { accentColor: "#D97706", secondaryColor: "#15182e", headingStyle: "underline", headingFont: "Poppins", bodyFont: "Inter", density: "normal" } },
  { key: "rightrail", label: "Right Rail", family: "Two-column", columns: "double", sidebar: "accent-right",
    default: { accentColor: "#16A34A", headingStyle: "underline", headingFont: "Montserrat", bodyFont: "Inter", density: "normal" } },

  { key: "timeline", label: "Timeline", family: "Timeline & creative", columns: "single",
    default: { accentColor: "#7C3AED", headingStyle: "side", headingFont: "Space Grotesk", bodyFont: "Inter", density: "normal" } },
  { key: "creative", label: "Creative", family: "Timeline & creative", columns: "single",
    default: { accentColor: "#DB2777", secondaryColor: "#7C3AED", headingStyle: "block", headingFont: "Poppins", bodyFont: "Inter", density: "normal" } },

  { key: "minimalist", label: "Minimalist", family: "Minimal & serif", columns: "single",
    default: { accentColor: "#111827", headingStyle: "rule", headingFont: "Space Grotesk", bodyFont: "Inter", density: "relaxed" } },
  { key: "executive", label: "Executive", family: "Minimal & serif", columns: "single",
    default: { accentColor: "#7c2d12", headingStyle: "rule", fontType: "serif", headingFont: "Playfair Display", bodyFont: "Lora", density: "relaxed" } },
  { key: "classic", label: "Classic ATS", family: "Minimal & serif", columns: "single",
    default: { accentColor: "#111827", headingStyle: "rule", headingFont: "Inter", bodyFont: "Inter", density: "normal" } },
];

/** Legacy keys → nearest new template. */
const ALIASES: Record<string, string> = {
  professional: "corporate", minimal: "minimalist", clean: "cascade",
  fresher: "compact", sidebar: "darksidebar",
};

export function templateDef(key: string): TemplateDef {
  const k = ALIASES[key] ?? key;
  return TEMPLATE_DEFS.find((t) => t.key === k) ?? TEMPLATE_DEFS[0];
}

export interface EffectiveStyle {
  template: string;
  family: TemplateFamily;
  columns: "single" | "double";
  sidebar?: Sidebar;
  accentColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  fontType: "sans" | "serif";
  headingStyle: HeadingStyle;
  divider: DividerStyle;
  density: Density;
  skillsStyle: "chips" | "inline";
  eduStyle: "list" | "table";
  lineSpacing: number;
  onePage: boolean;
  showUae: boolean;
  photoSize: number;
}

/** Merge user overrides over the template's signature default over global defaults. */
export function resolveStyle(style?: Partial<ResumeStyle>): EffectiveStyle {
  const def = templateDef(style?.template ?? "corporate");
  const d = def.default;
  const pick = <T,>(u: T | undefined, t: T | undefined, g: T): T => (u ?? t ?? g);
  return {
    template: def.key,
    family: def.family,
    columns: def.columns,
    sidebar: def.sidebar,
    accentColor: pick(style?.accentColor, d.accentColor, "#1A1D3E"),
    secondaryColor: pick(style?.secondaryColor, d.secondaryColor, def.default.accentColor ?? "#1A1D3E"),
    headingFont: pick(style?.headingFont, d.headingFont, style?.fontFamily ?? "Inter"),
    bodyFont: pick(style?.bodyFont, d.bodyFont, style?.fontFamily ?? "Inter"),
    fontType: pick(style?.fontType, d.fontType, "sans"),
    headingStyle: pick(style?.headingStyle, d.headingStyle, "underline"),
    divider: pick(style?.divider, d.divider, "line"),
    density: pick(style?.density, d.density, "normal"),
    skillsStyle: pick(style?.skillsStyle, d.skillsStyle, "chips"),
    eduStyle: pick(style?.eduStyle, d.eduStyle, "list"),
    lineSpacing: pick(style?.lineSpacing, d.lineSpacing, 1.4),
    onePage: pick(style?.onePage, d.onePage, false),
    showUae: pick(style?.showUae, d.showUae, true),
    photoSize: pick(style?.photoSize, d.photoSize, 66),
  };
}

/** Seed style with a template's signature theme when the user picks it. */
export function seedTemplate(style: ResumeStyle, key: string): ResumeStyle {
  const def = templateDef(key);
  return { ...style, template: def.key, columns: def.columns, ...def.default };
}

/** Curated accent + secondary palettes for the colour picker. */
export const PALETTES: { name: string; accent: string; secondary: string }[] = [
  { name: "Navy", accent: "#1A1D3E", secondary: "#3949AB" },
  { name: "Orange", accent: "#FF6B35", secondary: "#1A1D3E" },
  { name: "Teal", accent: "#0D9488", secondary: "#134E4A" },
  { name: "Royal", accent: "#2563EB", secondary: "#1E3A8A" },
  { name: "Emerald", accent: "#16A34A", secondary: "#14532D" },
  { name: "Violet", accent: "#7C3AED", secondary: "#4C1D95" },
  { name: "Magenta", accent: "#DB2777", secondary: "#831843" },
  { name: "Amber", accent: "#D97706", secondary: "#15182E" },
  { name: "Burgundy", accent: "#9F1239", secondary: "#4C0519" },
  { name: "Slate", accent: "#475569", secondary: "#0F172A" },
  { name: "Sky", accent: "#0EA5E9", secondary: "#075985" },
  { name: "Ink", accent: "#111827", secondary: "#374151" },
];

export const ACCENT_SWATCHES = PALETTES.map((p) => p.accent);

export const HEADING_FONTS = ["Inter", "Poppins", "Montserrat", "Space Grotesk", "Playfair Display", "Lora", "Merriweather"];
export const BODY_FONTS = ["Inter", "Roboto", "Open Sans", "Source Sans 3", "Lora", "Merriweather"];

/** Map a font family name to its self-hosted CSS variable stack. */
export function fontStack(family: string): string {
  const map: Record<string, string> = {
    Inter: "var(--font-inter)",
    Roboto: "var(--font-roboto)",
    "Open Sans": "var(--font-open-sans)",
    "Source Sans 3": "var(--font-source-sans)",
    Poppins: "var(--font-poppins)",
    Montserrat: "var(--font-montserrat)",
    "Space Grotesk": "var(--font-space-grotesk)",
    Lora: "var(--font-lora)",
    Merriweather: "var(--font-merriweather)",
    "Playfair Display": "var(--font-playfair)",
  };
  const serif = ["Lora", "Merriweather", "Playfair Display"].includes(family);
  return `${map[family] ?? "var(--font-inter)"}, ${serif ? "Georgia, serif" : "system-ui, sans-serif"}`;
}
