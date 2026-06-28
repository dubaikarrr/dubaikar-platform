"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/actions/notifications";
import type { Connection, MemberProfile } from "@/lib/database.types";

export type ConnState = "none" | "pending-sent" | "pending-received" | "accepted" | "declined";

export interface Member extends MemberProfile {
  connState: ConnState;
  connectionId?: string;
  /** Visible only once connected. */
  email?: string;
}

export interface ConnectionRequest {
  id: string;
  requester: MemberProfile | null;
  created_at: string;
}

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function stateFor(c: Connection, myId: string): ConnState {
  if (c.status === "accepted") return "accepted";
  if (c.status === "declined") return "declined";
  return c.requester_id === myId ? "pending-sent" : "pending-received";
}

/** All members (except me) with my connection state for each. */
export async function listMembers(): Promise<Member[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const [{ data: members }, { data: conns }] = await Promise.all([
    supabase.from("member_directory").select("*").neq("id", user.id).limit(200),
    supabase.from("connections").select("*").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const connByOther = new Map<string, Connection>();
  for (const c of (conns as Connection[] | null) ?? []) {
    const other = c.requester_id === user.id ? c.receiver_id : c.requester_id;
    connByOther.set(other, c);
  }

  // Emails for accepted connections only (service role; never exposed otherwise).
  const acceptedIds = [...connByOther.entries()]
    .filter(([, c]) => c.status === "accepted")
    .map(([id]) => id);
  const emails = new Map<string, string>();
  if (acceptedIds.length) {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("id,email").in("id", acceptedIds);
    for (const p of (data as { id: string; email: string | null }[] | null) ?? []) {
      if (p.email) emails.set(p.id, p.email);
    }
  }

  return (((members as MemberProfile[] | null) ?? []).map((m) => {
    const c = connByOther.get(m.id);
    return {
      ...m,
      connState: c ? stateFor(c, user.id) : "none",
      connectionId: c?.id,
      email: c?.status === "accepted" ? emails.get(m.id) : undefined,
    };
  }));
}

export async function requestConnection(receiverId: string) {
  const { supabase, user } = await getUser();
  if (!user || receiverId === user.id) return { ok: false };
  const { error } = await supabase
    .from("connections")
    .insert({ requester_id: user.id, receiver_id: receiverId });
  if (error) return { ok: false, error: error.message };

  const { data: me } = await supabase
    .from("member_directory").select("full_name").eq("id", user.id).maybeSingle();
  await notify(receiverId, {
    type: "connection_request",
    title: `${(me as { full_name: string | null } | null)?.full_name ?? "Someone"} wants to connect`,
    href: "/app/community?tab=requests",
  });
  revalidatePath("/app/community");
  return { ok: true };
}

export async function respondConnection(connectionId: string, accept: boolean) {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false };
  const { data: conn } = await supabase
    .from("connections").select("*").eq("id", connectionId).maybeSingle();
  const c = conn as Connection | null;
  if (!c || c.receiver_id !== user.id || c.status !== "pending") return { ok: false };

  await supabase
    .from("connections")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", connectionId);

  if (accept) {
    const { data: me } = await supabase
      .from("member_directory").select("full_name").eq("id", user.id).maybeSingle();
    await notify(c.requester_id, {
      type: "connection_accepted",
      title: `${(me as { full_name: string | null } | null)?.full_name ?? "Someone"} accepted your connection`,
      href: "/app/community?tab=people",
    });
  }
  revalidatePath("/app/community");
  return { ok: true };
}

/** Incoming pending requests with requester profile. */
export async function listRequests(): Promise<ConnectionRequest[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  const list = (data as Connection[] | null) ?? [];
  if (!list.length) return [];
  const { data: profiles } = await supabase
    .from("member_directory").select("*").in("id", list.map((c) => c.requester_id));
  const byId = new Map(((profiles as MemberProfile[] | null) ?? []).map((m) => [m.id, m]));
  return list.map((c) => ({ id: c.id, requester: byId.get(c.requester_id) ?? null, created_at: c.created_at }));
}
