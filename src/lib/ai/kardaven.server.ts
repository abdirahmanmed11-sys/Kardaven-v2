import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { jsonSchema, Output, streamText, type ModelMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export const KARDAVEN_MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export const KARDAVEN_SYSTEM = `You are Kardaven, the AI agent of the KARDAVEN app — a platform where people turn real problems into action plans with the help of communities.
Style: concise and pragmatic. Short paragraphs or bullet points, concrete next actions, no filler. Ask at most one clarifying question, only when truly needed.
Always reply in the user's language (French or English).
You know the whole app and guide users to the right place with markdown links:
- [Résoudre un problème](/solve) — submit a problem and get an AI action plan
- [Problèmes](/problems) — browse problems, replies and plans
- [Communautés](/community) — join communities, posts and live rooms
- [Missions](/missions) — freelance missions
- [Traduire](/translate), [Tableau de bord](/dashboard), [Profil](/profile), [Aide](/help)
For medical, legal or financial topics, give practical guidance and recommend a professional when stakes are high.`;

export function gatewayProvider(runId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const runIdFetch = createLovableAiGatewayRunIdFetch(runId);
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

export const reasoningOptions = (effort: "low" | "medium" = "low") => ({
  openai: {
    forceReasoning: true,
    reasoningEffort: effort,
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
});

/** Supabase client acting as the caller (RLS applies). */
export function userClient(token: string) {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}`, apikey: key } },
  });
}

/** One-shot text from Kardaven (streamed, consumed server-side). */
export async function kardavenText(prompt: string, system = KARDAVEN_SYSTEM) {
  const { provider } = gatewayProvider();
  const result = streamText({
    model: provider.responses(KARDAVEN_MODEL),
    instructions: system,
    messages: [{ role: "user", content: prompt }] as ModelMessage[],
    providerOptions: reasoningOptions("low"),
  });
  return (await result.text).trim();
}

export type Analysis = { diagnostic: string; steps: string[]; pitfalls: string[]; resources: string[]; eta: string };

const analysisSchema = jsonSchema<Analysis>({
  type: "object",
  additionalProperties: false,
  required: ["diagnostic", "steps", "pitfalls", "resources", "eta"],
  properties: {
    diagnostic: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    pitfalls: { type: "array", items: { type: "string" } },
    resources: { type: "array", items: { type: "string" } },
    eta: { type: "string" },
  },
});

export async function kardavenAnalyze(p: { title: string; category: string; description: string; goal: string; constraints: string; tried: string }, lang: string) {
  const { provider } = gatewayProvider();
  const result = streamText({
    model: provider.responses(KARDAVEN_MODEL),
    instructions: `${KARDAVEN_SYSTEM}
Task: analyse the submitted problem. Write everything in ${lang === "fr" ? "French" : "English"}, plain text only (no markdown, no links).
- diagnostic: 2-4 sentences on the likely root cause and the strategic angle.
- steps: 4-6 concrete, ordered action steps (one short sentence each, starting with a verb).
- pitfalls: 2-4 traps to avoid.
- resources: 2-4 recommended resources (tools, methods, types of experts, free materials).
- eta: realistic time estimate to resolve, e.g. "3-4 semaines".`,
    messages: [{ role: "user", content: JSON.stringify(p) }],
    output: Output.object({ schema: analysisSchema }),
    providerOptions: reasoningOptions("medium"),
  });
  return await result.output;
}
