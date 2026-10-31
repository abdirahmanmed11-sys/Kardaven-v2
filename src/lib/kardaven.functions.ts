import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ProblemInput = { title: string; category: string; description: string; goal: string; constraints: string; tried: string; lang: string };

export const analyzeProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ProblemInput) => d)
  .handler(async ({ data }) => {
    const { kardavenAnalyze } = await import("@/lib/ai/kardaven.server");
    const { lang, ...p } = data;
    return await kardavenAnalyze(p, lang);
  });

type RoomInput = { mode: "ask" | "summary"; question: string; history: { author: string; body: string }[]; lang: string; room: string };

export const roomAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: RoomInput) => ({ ...d, history: d.history.slice(-40) }))
  .handler(async ({ data }) => {
    const { kardavenText } = await import("@/lib/ai/kardaven.server");
    const log = data.history.map((m) => `${m.author}: ${m.body}`).join("\n");
    const lang = data.lang === "fr" ? "French" : "English";
    const prompt = data.mode === "summary"
      ? `Summarise this community room chat (#${data.room}) in ${lang}: key points, decisions and open questions, as 3-6 short bullets. Plain text, no markdown headings.\n\n${log}`
      : `You are answering inside community room #${data.room}. Recent chat:\n${log}\n\nQuestion for you (reply in ${lang}, short, plain text): ${data.question}`;
    return { text: await kardavenText(prompt) };
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("chat_threads").select("id,title,updated_at").order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("chat_threads").insert({ user_id: context.userId }).select("id").single();
    if (error) throw new Error(error.message);
    return data.id;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chat_threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return true;
  });

export const loadThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: t } = await context.supabase.from("chat_threads").select("id").eq("id", data.id).maybeSingle();
    if (!t) return null;
    const { data: rows, error } = await context.supabase.from("chat_messages").select("message_id,role,parts").eq("thread_id", data.id).order("created_at");
    if (error) throw new Error(error.message);
    return rows.map((r) => ({ id: r.message_id, role: r.role, parts: r.parts }));
  });
