/**
 * Hand-authored types mirroring /supabase/migrations. Kept in sync manually
 * (or regenerate later with `supabase gen types typescript`).
 */

export type Stage =
  | "plan"
  | "prepare"
  | "apply"
  | "depart"
  | "arrive"
  | "settle";

export type PrimaryReason = "employment" | "business" | "freelance" | "family";
export type LeadType =
  | "accommodation"
  | "visa"
  | "save_budget"
  | "setup"
  | "session";
export type LeadStatus = "new" | "contacted" | "closed";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
  current_stage: Stage;
  target_move_date: string | null;
  primary_reason: PrimaryReason | null;
  industry: string | null;
  experience_band: string | null;
  education: string | null;
  visa_status: string | null;
  has_offer: boolean;
  target_salary_aed: number | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export type JourneyStep = {
  id: string;
  user_id: string;
  stage: Stage;
  step_key: string;
  label: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export type Resume = {
  id: string;
  user_id: string;
  title: string;
  data: ResumeData;
  template_key: string;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

export type Budget = {
  id: string;
  user_id: string;
  title?: string | null;
  inputs: Record<string, unknown>;
  total_aed: number;
  one_time_aed: number;
  monthly_aed: number;
  buffer_aed: number;
  created_at: string;
  updated_at: string;
}

export type Lead = {
  id: string;
  user_id: string | null;
  type: LeadType;
  payload: Record<string, unknown>;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type AllowedEmail = {
  email: string;
  note: string | null;
  created_at: string;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  category: string;
  body: string;
  deleted: boolean;
  created_at: string;
};

export type CommunityReply = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  deleted: boolean;
  created_at: string;
};

export type PostLike = {
  post_id: string;
  user_id: string;
  created_at: string;
};

export type ConnectionStatus = "pending" | "accepted" | "declined";
export type Connection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_type: "post" | "reply" | "user";
  target_id: string;
  reason: string | null;
  created_at: string;
};

export type AppNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  created_at: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  kind: "area" | "guide";
  ref_key: string;
  created_at: string;
};

export type WebinarStatus = "created" | "paid" | "failed";
export type WebinarRegistration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  profession: string | null;
  experience: string | null;
  amount_inr: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: WebinarStatus;
  created_at: string;
  updated_at: string;
};

/** Safe public subset of a profile (member_directory view). */
export type MemberProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_stage: Stage;
  industry: string | null;
  target_move_date: string | null;
};

/** Shape stored in resumes.data (jsonb). */
export type PhotoShape = "rect" | "round" | "square";

export type ResumeExperience = {
  company: string;
  role: string;
  location?: string;
  start?: string; // "YYYY-MM"
  end?: string; // "YYYY-MM"
  current?: boolean;
  descriptionHtml?: string; // Tiptap rich text
  bullets?: string[]; // legacy / derived plain text (for ATS)
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  field?: string;
  start?: string;
  year?: string; // graduation / end
  grade?: string;
  current?: boolean;
};

export type ResumeProject = {
  name: string;
  link?: string;
  start?: string;
  end?: string;
  descriptionHtml?: string;
};

export type ResumeCertification = {
  name: string;
  issuer?: string;
  date?: string;
};

export type ResumeAward = {
  title: string;
  issuer?: string;
  date?: string;
  descriptionHtml?: string;
};

export type ResumeLanguage = { name: string; proficiency?: string };

export type ResumeReference = {
  name: string;
  title?: string;
  company?: string;
  contact?: string;
};

export type ResumeCustomSection = {
  id: string;
  title: string;
  itemsHtml?: string;
};

export type HeadingStyle = "bar" | "underline" | "rule" | "side" | "block";
export type DividerStyle = "line" | "none" | "dotted";
export type Density = "compact" | "normal" | "relaxed";

export type ResumeStyle = {
  template: string; // template key
  columns: "single" | "double";
  accentColor: string;
  secondaryColor?: string;
  fontFamily: string; // legacy single-font fallback
  fontType: "sans" | "serif";
  headingFont?: string; // pairing: heading family
  bodyFont?: string; // pairing: body family
  headingStyle?: HeadingStyle;
  divider?: DividerStyle;
  density?: Density;
  skillsStyle?: "chips" | "inline";
  eduStyle?: "list" | "table";
  lineSpacing: number; // 1.0 – 1.6
  onePage: boolean;
  showUae?: boolean;
  photoSize?: number;
};

/** Section order + visibility (drag-reorder, show/hide). */
export type ResumeLayout = {
  order: string[];
  hidden: string[];
};

export type ResumeData = {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    github?: string;
    nationality?: string;
    visaStatus?: string;
    noticePeriod?: string;
    summary: string; // plain (for ATS); summaryHtml for display
    summaryHtml?: string;
    photo?: string; // base64 data URL
    photoShape?: PhotoShape;
  };
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  softSkills?: string[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  projects?: ResumeProject[];
  awards?: ResumeAward[];
  references?: {
    mode: "on-request" | "hidden" | "custom";
    items?: ResumeReference[];
  };
  customSections?: ResumeCustomSection[];
  style?: ResumeStyle;
  layout?: ResumeLayout;
  /** @deprecated use style.accentColor */
  accentColor?: string;
}

/** Minimal generic shape so the typed Supabase client compiles. */
type Row<T> = T;
type Insertable<T> = Partial<T>;
type Updatable<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Row<Profile>;
        Insert: Insertable<Profile>;
        Update: Updatable<Profile>;
        Relationships: [];
      };
      journey_steps: {
        Row: Row<JourneyStep>;
        Insert: Insertable<JourneyStep>;
        Update: Updatable<JourneyStep>;
        Relationships: [];
      };
      resumes: {
        Row: Row<Resume>;
        Insert: Insertable<Resume>;
        Update: Updatable<Resume>;
        Relationships: [];
      };
      budgets: {
        Row: Row<Budget>;
        Insert: Insertable<Budget>;
        Update: Updatable<Budget>;
        Relationships: [];
      };
      leads: {
        Row: Row<Lead>;
        Insert: Insertable<Lead>;
        Update: Updatable<Lead>;
        Relationships: [];
      };
      allowed_emails: {
        Row: Row<AllowedEmail>;
        Insert: Insertable<AllowedEmail>;
        Update: Updatable<AllowedEmail>;
        Relationships: [];
      };
      community_posts: {
        Row: Row<CommunityPost>;
        Insert: Insertable<CommunityPost>;
        Update: Updatable<CommunityPost>;
        Relationships: [];
      };
      community_replies: {
        Row: Row<CommunityReply>;
        Insert: Insertable<CommunityReply>;
        Update: Updatable<CommunityReply>;
        Relationships: [];
      };
      post_likes: {
        Row: Row<PostLike>;
        Insert: Insertable<PostLike>;
        Update: Updatable<PostLike>;
        Relationships: [];
      };
      connections: {
        Row: Row<Connection>;
        Insert: Insertable<Connection>;
        Update: Updatable<Connection>;
        Relationships: [];
      };
      reports: {
        Row: Row<Report>;
        Insert: Insertable<Report>;
        Update: Updatable<Report>;
        Relationships: [];
      };
      notifications: {
        Row: Row<AppNotification>;
        Insert: Insertable<AppNotification>;
        Update: Updatable<AppNotification>;
        Relationships: [];
      };
      bookmarks: {
        Row: Row<Bookmark>;
        Insert: Insertable<Bookmark>;
        Update: Updatable<Bookmark>;
        Relationships: [];
      };
      webinar_registrations: {
        Row: Row<WebinarRegistration>;
        Insert: Insertable<WebinarRegistration>;
        Update: Updatable<WebinarRegistration>;
        Relationships: [];
      };
    };
    Views: {
      member_directory: {
        Row: Row<MemberProfile>;
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
    Enums: {
      stage: Stage;
      primary_reason: PrimaryReason;
      lead_type: LeadType;
      lead_status: LeadStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
