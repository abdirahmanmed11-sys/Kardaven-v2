import { useSyncExternalStore } from "react";

/* Sample communities. Everything here is demo data — memberships and posts are
   stored only in this browser until shared storage and accounts are connected. */

export const COMMUNITY_CATEGORIES = ["Business", "Education", "Technology", "Health", "Community"] as const;
export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
export const POST_TAGS = ["Question", "Idea", "Result"] as const;
export type PostTag = (typeof POST_TAGS)[number];

export type CReply = { id: string; author: string; body: string; at: string; isDemo: boolean };
export type CPost = { id: string; title: string; body: string; tag: PostTag; author: string; at: string; votes: number; replies: CReply[]; isDemo: boolean };
export type Community = {
  slug: string; name: string; category: CommunityCategory; tagline: string; members: number; posts: CPost[];
  founder: string; avatar?: string | undefined; banner?: string | undefined; rules?: string | undefined; parent?: string | undefined; isDemo?: boolean; mine?: boolean;
};

const r = (id: string, author: string, body: string, at: string): CReply => ({ id, author, body, at, isDemo: true });
const p = (id: string, title: string, body: string, tag: PostTag, author: string, at: string, votes: number, replies: CReply[] = []): CPost =>
  ({ id, title, body, tag, author, at, votes, replies, isDemo: true });

export const DEMO_COMMUNITIES: Community[] = [];

/* ---------- Local store (browser only) ---------- */
type State = { joined: string[]; posts: Record<string, CPost[]>; replies: Record<string, CReply[]>; created: Community[] };
const KEY = "kardaven:community:v1";
const empty: State = { joined: [], posts: {}, replies: {}, created: [] };
let cache: State | null = null;
const listeners = new Set<() => void>();
function read(): State {
  if (cache) return cache;
  try { cache = { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { cache = empty; }
  return cache!;
}
function write(n: State) { cache = n; localStorage.setItem(KEY, JSON.stringify(n)); listeners.forEach((l) => l()); }
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export const useCommunityStore = () => useSyncExternalStore(subscribe, read, () => empty);

const today = () => new Date().toISOString().slice(0, 10);

export function getCommunity(st: State, slug: string): Community | undefined {
  const c = allCommunities(st).find((x) => x.slug === slug);
  if (!c) return undefined;
  const posts = [...(st.posts[slug] ?? []), ...c.posts].map((po) => ({ ...po, replies: [...po.replies, ...(st.replies[`${slug}/${po.id}`] ?? [])] }));
  return { ...c, posts };
}

export const isJoined = (st: State, slug: string) => st.joined.includes(slug);
export function toggleJoin(slug: string) {
  const st = read();
  write({ ...st, joined: st.joined.includes(slug) ? st.joined.filter((s) => s !== slug) : [...st.joined, slug] });
}
export function addPost(slug: string, title: string, body: string, tag: PostTag) {
  const st = read();
  const post: CPost = { id: "u-" + Date.now().toString(36), title, body, tag, author: "You", at: today(), votes: 0, replies: [], isDemo: false };
  write({ ...st, posts: { ...st.posts, [slug]: [post, ...(st.posts[slug] ?? [])] } });
  return post.id;
}
export function addCommunityReply(slug: string, postId: string, body: string) {
  const st = read(); const k = `${slug}/${postId}`;
  write({ ...st, replies: { ...st.replies, [k]: [...(st.replies[k] ?? []), { id: "r-" + Date.now(), author: "You", body, at: today(), isDemo: false }] } });
}

export type SortMode = "new" | "top" | "active";
export function sortPosts(posts: CPost[], mode: SortMode) {
  const a = [...posts];
  if (mode === "top") return a.sort((x, y) => y.votes - x.votes);
  if (mode === "active") return a.sort((x, y) => y.replies.length - x.replies.length);
  return a.sort((x, y) => y.at.localeCompare(x.at));
}

/* ---------- User-created communities & sub-communities ---------- */
export const allCommunities = (st: State): Community[] => [...st.created, ...DEMO_COMMUNITIES];
export const topLevel = (st: State) => allCommunities(st).filter((c) => !c.parent);
export const subsOf = (st: State, slug: string) => allCommunities(st).filter((c) => c.parent === slug);

const slugify = (n: string) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "community";

export type CommunityInput = { name: string; tagline: string; category: CommunityCategory; rules?: string | undefined; avatar?: string | undefined; banner?: string | undefined; parent?: string | undefined };
export function createCommunity(input: CommunityInput) {
  const st = read();
  let slug = slugify(input.name);
  while (allCommunities(st).some((c) => c.slug === slug)) slug += "-" + Math.random().toString(36).slice(2, 5);
  const c: Community = { ...input, slug, members: 1, posts: [], founder: "You", mine: true, isDemo: false };
  write({ ...st, created: [c, ...st.created], joined: [...st.joined, slug] });
  return slug;
}
export function updateCommunity(slug: string, patch: Partial<CommunityInput>) {
  const st = read();
  write({ ...st, created: st.created.map((c) => (c.slug === slug ? { ...c, ...patch } : c)) });
}

/** Shrinks a picked image to a small square/wide JPEG so it fits in browser storage. */
export function resizeImage(file: File, max = 320): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      res(cv.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = rej; img.src = url;
  });
}

/* ---------- Votes (Reddit/Quora style) ---------- */
type Extra = { votes: Record<string, 1 | -1>; chat: Record<string, ChatMsg[]>; voice: Record<string, boolean> };
export type ChatMsg = { id: string; author: string; body: string; at: string; ai?: boolean; hidden?: boolean };
const XKEY = "kardaven:community:extra:v1";
const xEmpty: Extra = { votes: {}, chat: {}, voice: {} };
let xcache: Extra | null = null;
const xl = new Set<() => void>();
function xread(): Extra {
  if (xcache) return xcache;
  try { xcache = { ...xEmpty, ...JSON.parse(localStorage.getItem(XKEY) || "{}") }; } catch { xcache = xEmpty; }
  return xcache!;
}
function xwrite(n: Extra) { xcache = n; localStorage.setItem(XKEY, JSON.stringify(n)); xl.forEach((l) => l()); }
export const useExtra = () => useSyncExternalStore((l) => { xl.add(l); return () => xl.delete(l); }, xread, () => xEmpty);

/** key = "slug/postId" or "slug/postId/replyId". Tapping the same arrow again removes the vote. */
export function vote(key: string, dir: 1 | -1) {
  const x = xread(); const v = { ...x.votes };
  if (v[key] === dir) delete v[key]; else v[key] = dir;
  xwrite({ ...x, votes: v });
}
export const myVote = (x: Extra, key: string) => x.votes[key] ?? 0;

/* ---------- Salon chat (channels) + simulated AI agent ---------- */
export const TEXT_CHANNELS = ["general", "help", "wins"] as const;
export type TextChannel = (typeof TEXT_CHANNELS)[number];
const BAD = ["idiot", "stupid", "con ", "connard", "nul ", "shut up", "ta gueule", "imbecile"];
export const isToxic = (s: string) => BAD.some((w) => (s.toLowerCase() + " ").includes(w));
const chKey = (slug: string, ch: string) => (ch === "general" ? slug : `${slug}/${ch}`);
const DEMO_CHAT = (_slug: string, _ch: string): ChatMsg[] => [];
export const chatOf = (x: Extra, slug: string, ch: string = "general") => [...DEMO_CHAT(slug, ch), ...(x.chat[chKey(slug, ch)] ?? [])];
const now = () => new Date().toTimeString().slice(0, 5);
function push(slug: string, m: ChatMsg, ch: string = "general") {
  const x = xread(); const k = chKey(slug, ch);
  xwrite({ ...x, chat: { ...x.chat, [k]: [...(x.chat[k] ?? []), m] } });
}

/** Simulated AI (no real model connected): moderates, answers @ai questions, summarizes. */
/** Add a Kardaven message to a room. */
export function pushAi(slug: string, body: string, ch: string = "general") {
  push(slug, { id: "k" + Date.now().toString(36), author: "Kardaven", ai: true, at: now(), body }, ch);
}

/** Returns the question when the message calls the AI (@ai / @ia / @kardaven), and the AI should answer for real. */
export function sendChat(slug: string, body: string, lang: "en" | "fr", ch: string = "general", realAi = false): string | null {
  const id = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  if (isToxic(body)) {
    push(slug, { id: id(), author: "You", body, at: now(), hidden: true }, ch);
    push(slug, { id: id(), author: "KARDAVEN AI", ai: true, at: now(), body: lang === "fr" ? "Message masqué : restons respectueux. (Modération IA simulée)" : "Message hidden: let's stay respectful. (Simulated AI moderation)" }, ch);
    return null;
  }
  push(slug, { id: id(), author: "You", body, at: now() }, ch);
  if (/^@?(ai|ia|kardaven)\b/i.test(body.trim())) {
    const q = body.replace(/^@?(ai|ia|kardaven)\b[:,]?\s*/i, "");
    if (realAi) return q;
    push(slug, { id: id(), author: "KARDAVEN AI", ai: true, at: now(), body: lang === "fr"
      ? `Pour « ${q} » : 1) précisez l'objectif, 2) testez une petite action cette semaine, 3) partagez le résultat ici. (Réponse simulée)`
      : `For "${q}": 1) define the goal, 2) test one small action this week, 3) share the result here. (Simulated answer)` }, ch);
  }
  return null;
}
export function summarizeChat(slug: string, lang: "en" | "fr", ch: string = "general") {
  const msgs = chatOf(xread(), slug, ch).filter((m) => !m.ai && !m.hidden);
  const people = [...new Set(msgs.map((m) => m.author))];
  const last = msgs.slice(-3).map((m) => `• ${m.author}: ${m.body.slice(0, 60)}`).join("\n");
  push(slug, { id: "s" + Date.now(), author: "KARDAVEN AI", ai: true, at: now(), body: lang === "fr"
    ? `Résumé (${msgs.length} messages, ${people.length} membres) :\n${last}\n(Résumé simulé)`
    : `Summary (${msgs.length} messages, ${people.length} members):\n${last}\n(Simulated summary)` }, ch);
}

/* ---------- Voice rooms (simulated — no real audio connected yet) ---------- */
export type VoiceRoom = { id: string; members: string[] };
export const voiceRoomsOf = (slug: string): VoiceRoom[] => [
  { id: "lounge", members: ["Amina K.", "Daniel O."] },
  { id: "cowork", members: ["Karim A."] },
];
const vKey = (slug: string, roomId: string) => `${slug}/${roomId}`;
export const inVoice = (x: Extra, slug: string, roomId: string) => !!x.voice[vKey(slug, roomId)];
export function toggleVoice(slug: string, roomId: string) {
  const x = xread(); const v = { ...x.voice }; const k = vKey(slug, roomId);
  if (v[k]) delete v[k]; else v[k] = true;
  xwrite({ ...x, voice: v });
}
