import { useSyncExternalStore } from "react";

/* Freelancing (Upwork/Fiverr style). Stored only in this browser; payments are SIMULATED —
   no real money moves until a payment provider is connected. */

export type Gig = { id: string; kind: "gig"; title: string; body: string; price: number; skills: string[]; author: string; verified: boolean; rating: number; at: string; isDemo: boolean };
export type Project = { id: string; kind: "project"; title: string; body: string; budget: number; skills: string[]; author: string; at: string; isDemo: boolean };
export type ContractStatus = "funded" | "delivered" | "released" | "refunded";
export type Contract = { id: string; itemId: string; title: string; amount: number; freelancer: string; client: string; status: ContractStatus; at: string };

const g = (id: string, title: string, body: string, price: number, skills: string[], author: string, rating: number, verified = true): Gig =>
  ({ id, kind: "gig", title, body, price, skills, author, verified, rating, at: "2026-10-20", isDemo: true });
export const DEMO_GIGS: Gig[] = [];
export const DEMO_PROJECTS: Project[] = [];

type State = { gigs: Gig[]; projects: Project[]; contracts: Contract[]; verified: boolean };
const KEY = "kardaven:freelance:v1";
const empty: State = { gigs: [], projects: [], contracts: [], verified: false };
let cache: State | null = null;
const ls = new Set<() => void>();
function read(): State {
  if (cache) return cache;
  try { cache = { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { cache = empty; }
  return cache!;
}
function write(n: State) { cache = n; localStorage.setItem(KEY, JSON.stringify(n)); ls.forEach((l) => l()); }
export const useFreelance = () => useSyncExternalStore((l) => { ls.add(l); return () => ls.delete(l); }, read, () => empty);

const today = () => new Date().toISOString().slice(0, 10);
const uid = (p: string) => p + Date.now().toString(36);
export const allGigs = (s: State) => [...s.gigs, ...DEMO_GIGS];
export const allProjects = (s: State) => [...s.projects, ...DEMO_PROJECTS];
export const findItem = (s: State, id: string) => [...allGigs(s), ...allProjects(s)].find((x) => x.id === id);

export function addGig(title: string, body: string, price: number, skills: string[]) {
  const s = read(); const it: Gig = { id: uid("ug"), kind: "gig", title, body, price, skills, author: "You", verified: s.verified, rating: 0, at: today(), isDemo: false };
  write({ ...s, gigs: [it, ...s.gigs] }); return it.id;
}
export function addProject(title: string, body: string, budget: number, skills: string[]) {
  const s = read(); const it: Project = { id: uid("uj"), kind: "project", title, body, budget, skills, author: "You", at: today(), isDemo: false };
  write({ ...s, projects: [it, ...s.projects] }); return it.id;
}
/** Verified badge request — simulated approval until real identity checks exist. */
export function setVerified(v: boolean) { write({ ...read(), verified: v }); }

/** Escrow flow: hire → funds held (funded) → freelancer delivers → client releases (or refund). */
export function hire(itemId: string) {
  const s = read(); const it = findItem(s, itemId); if (!it) return;
  const c: Contract = it.kind === "gig"
    ? { id: uid("c"), itemId, title: it.title, amount: it.price, freelancer: it.author, client: "You", status: "funded", at: today() }
    : { id: uid("c"), itemId, title: it.title, amount: it.budget, freelancer: "You", client: it.author, status: "funded", at: today() };
  write({ ...s, contracts: [c, ...s.contracts] }); return c.id;
}
const NEXT: Record<ContractStatus, ContractStatus[]> = { funded: ["delivered", "refunded"], delivered: ["released", "refunded"], released: [], refunded: [] };
export const canMove = (from: ContractStatus, to: ContractStatus) => NEXT[from].includes(to);
export function moveContract(id: string, to: ContractStatus) {
  const s = read();
  write({ ...s, contracts: s.contracts.map((c) => (c.id === id && canMove(c.status, to) ? { ...c, status: to } : c)) });
}
