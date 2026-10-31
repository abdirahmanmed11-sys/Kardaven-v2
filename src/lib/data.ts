import { useSyncExternalStore } from "react";

export type StepStatus = "todo" | "doing" | "done";
export type Step = { id: string; text: string; status: StepStatus };
export type Reply = { id: string; author: string; body: string; at: string; verified?: boolean; isDemo: boolean };
export type Problem = {
  id: string; title: string; category: Category; description: string; goal: string;
  constraints: string; tried: string; author: string; at: string; isDemo: boolean;
  aiSummary: string; steps: Step[]; replies: Reply[]; verified?: boolean;
  /** Set when the analysis came from the real Kardaven model. */
  ai?: { pitfalls: string[]; resources: string[]; eta: string };
};

export const CATEGORIES = ["Business", "Education", "Technology", "Health", "Community", "Personal"] as const;
export type Category = (typeof CATEGORIES)[number];

const s = (id: string, text: string, status: StepStatus = "todo"): Step => ({ id, text, status });

export const DEMO_PROBLEMS: Problem[] = [];

/* ---------- Local store (browser only; swap for a database later) ---------- */
type State = { problems: Problem[]; demoOverrides: Record<string, { steps?: Step[]; replies?: Reply[] }> };
const KEY = "kardaven:v1";
const empty: State = { problems: [], demoOverrides: {} };
let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try { cache = { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { cache = empty; }
  return cache!;
}
function write(next: State) { cache = next; localStorage.setItem(KEY, JSON.stringify(next)); listeners.forEach((l) => l()); }
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useStore() {
  return useSyncExternalStore(subscribe, read, () => empty);
}

export function allProblems(st: State): Problem[] {
  const demos = DEMO_PROBLEMS.map((p) => ({ ...p, ...st.demoOverrides[p.id] }));
  return [...st.problems, ...demos];
}

export type Analysis = { diagnostic: string; steps: string[]; pitfalls: string[]; resources: string[]; eta: string };

export function addProblem(input: Omit<Problem, "id" | "at" | "isDemo" | "aiSummary" | "steps" | "replies" | "author" | "ai">, analysis?: Analysis) {
  const id = "u-" + Date.now().toString(36);
  const gen = analysis
    ? { aiSummary: analysis.diagnostic, steps: analysis.steps.map((t, i) => s(String(i + 1), t)), ai: { pitfalls: analysis.pitfalls, resources: analysis.resources, eta: analysis.eta } }
    : simulateAI(input);
  const p: Problem = { ...input, id, at: new Date().toISOString().slice(0, 10), isDemo: false, author: "You", replies: [], ...gen };
  const st = read();
  write({ ...st, problems: [p, ...st.problems] });
  return id;
}

function patch(id: string, fn: (p: Problem) => Partial<Problem>) {
  const st = read();
  if (id.startsWith("demo-")) {
    const base = allProblems(st).find((p) => p.id === id)!;
    write({ ...st, demoOverrides: { ...st.demoOverrides, [id]: { ...st.demoOverrides[id], ...fn(base) } } });
  } else {
    write({ ...st, problems: st.problems.map((p) => (p.id === id ? { ...p, ...fn(p) } : p)) });
  }
}

const next: Record<StepStatus, StepStatus> = { todo: "doing", doing: "done", done: "todo" };
export const cycleStep = (pid: string, sid: string) =>
  patch(pid, (p) => ({ steps: p.steps.map((x) => (x.id === sid ? { ...x, status: next[x.status] } : x)) }));

export const addReply = (pid: string, body: string) =>
  patch(pid, (p) => ({ replies: [...p.replies, { id: "r-" + Date.now(), author: "You", body, at: new Date().toISOString().slice(0, 10), isDemo: false }] }));

export const progressOf = (p: Problem) => (p.steps.length ? Math.round((p.steps.filter((x) => x.status === "done").length / p.steps.length) * 100) : 0);

/* ---------- Simulated AI: deterministic template, NOT a real model ---------- */
export function simulateAI(i: { title: string; description: string; goal: string; constraints: string; tried: string }) {
  const short = (t: string, n = 90) => (t.length > n ? t.slice(0, n).trim() + "…" : t);
  const aiSummary = `You want to: ${short(i.goal || i.title)}. Main challenge: ${short(i.description)}${i.constraints ? ` Working within: ${short(i.constraints, 60)}.` : ""}${i.tried ? ` Previous attempts (${short(i.tried, 50)}) suggest trying a different angle.` : ""} Community replies will refine this plan.`;
  const steps: Step[] = [
    s("1", "Clarify the root cause: list 3 possible reasons the problem exists"),
    s("2", `Define a measurable target for: ${short(i.goal || i.title, 60)}`),
    s("3", i.constraints ? `Pick one small experiment that fits: ${short(i.constraints, 50)}` : "Pick one small, low-cost experiment"),
    s("4", "Run the experiment for 1–2 weeks and note results"),
    s("5", "Share results here and adjust the plan with community feedback"),
  ];
  return { aiSummary, steps };
}
