import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { addPost, DEMO_COMMUNITIES, getCommunity, subsOf, isJoined, POST_TAGS, sortPosts, toggleJoin, useCommunityStore, type PostTag, type SortMode } from "@/lib/community";
import { CommunityAvatar, SourceBadge, VerifiedBadge } from "@/components/kardaven";
import { VoteBox } from "@/components/spaces";
import { Salon } from "@/components/salon";

export const Route = createFileRoute("/community/$slug")({
  loader: ({ params }) => {
    const c = DEMO_COMMUNITIES.find((x) => x.slug === params.slug);
    return c ? { name: c.name, tagline: c.tagline } : null;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — KARDAVEN` : "Community — KARDAVEN" },
      { name: "description", content: loaderData?.tagline ?? "KARDAVEN community" },
      { property: "og:title", content: loaderData ? `${loaderData.name} — KARDAVEN` : "Community — KARDAVEN" },
      { property: "og:description", content: loaderData?.tagline ?? "KARDAVEN community" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});

const tagCls: Record<PostTag, string> = { Question: "text-electric", Idea: "text-gold", Result: "text-success" };

function CommunityPage() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const st = useCommunityStore();
  const c = getCommunity(st, slug);
  const joined = isJoined(st, slug);
  const [sort, setSort] = useState<SortMode>("new");
  const [tag, setTag] = useState<"all" | PostTag>("all");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"posts" | "salon">("posts");
  const { lang } = useI18n();
  const [f, setF] = useState({ title: "", body: "", tag: "Question" as PostTag });
  const posts = useMemo(() => c ? sortPosts(c.posts.filter((p) => tag === "all" || p.tag === tag), sort) : [], [c, sort, tag]);
  const field = "w-full rounded-xl border border-input bg-muted/40 px-3.5 py-3 text-base outline-none focus:border-electric";

  if (!c) return <div className="py-20 text-center text-muted-foreground">{t("no_results")} · <Link to="/community" className="text-electric">{t("back_com")}</Link></div>;
  const subs = subsOf(st, slug);
  const parentC = c.parent ? getCommunity(st, c.parent) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to={parentC ? "/community/$slug" : "/community"} params={{ slug: parentC?.slug ?? slug }} className="text-sm text-muted-foreground hover:text-foreground">← {parentC ? parentC.name : t("back_com")}</Link>
      <div className="mt-4 overflow-hidden rounded-2xl glass">
        <div className="h-28 bg-gradient-to-br from-electric/30 via-accent to-gold/20">{c.banner && <img src={c.banner} alt="" className="h-full w-full object-cover" />}</div>
        <div className="px-5 pb-5">
        <div className="-mt-8 flex items-end gap-3">
          <CommunityAvatar c={c} className="h-16 w-16 border-4 border-card" />
          {c.mine && <Link to="/community/new" search={{ edit: c.slug, parent: undefined }} className="tap mb-1 ml-auto rounded-full border border-border px-3 py-1 text-xs">{t("cc_edit")}</Link>}
        </div>
        <div className="mt-3 flex items-center gap-2"><span className="eyebrow text-electric">{c.category}</span><SourceBadge isDemo={!!c.isDemo} /></div>
        <h1 className="mt-2 flex items-center gap-1.5 text-2xl font-semibold">{c.name}<VerifiedBadge className="h-5 w-5" title={t("cc_verified")} /></h1>
        {parentC && <p className="text-xs text-muted-foreground">{t("cc_in")} {parentC.name}</p>}
        <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
        <p className="mt-2 flex items-center gap-1 text-xs"><span className="text-muted-foreground">{t("cc_founder")} :</span> <span className="font-semibold">{c.founder}</span><VerifiedBadge className="h-3.5 w-3.5" title={t("cc_verified")} /></p>
        {c.rules && <p className="mt-2 whitespace-pre-line rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">{c.rules}</p>}
        <div className="mt-4 flex items-center gap-3">
          <p className="font-mono text-xs text-muted-foreground">{(c.members + (joined ? 1 : 0)).toLocaleString()} {t("members")} <span className="text-gold">({t("demo")})</span></p>
          <button onClick={() => toggleJoin(slug)} aria-pressed={joined}
            className={`tap ml-auto rounded-xl px-5 py-2 text-sm font-semibold ${joined ? "border border-gold/50 text-gold" : "bg-primary text-primary-foreground"}`}>
            {joined ? `✓ ${t("joined")}` : t("join")}
          </button>
        </div>
        </div>
      </div>

      {!c.parent && (
        <div className="mt-5">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">{t("cc_subs")}</h2>
            <Link to="/community/new" search={{ parent: slug, edit: undefined }} className="text-xs text-electric">+ {t("cc_sub_new")}</Link></div>
          <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
            {subs.map((s2) => (
              <Link key={s2.slug} to="/community/$slug" params={{ slug: s2.slug }} className="tap flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-2xl glass p-3 text-center">
                <CommunityAvatar c={s2} className="h-12 w-12" /><span className="line-clamp-2 text-xs font-semibold">{s2.name}</span>
              </Link>
            ))}
            {!subs.length && <p className="text-xs text-muted-foreground">—</p>}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-5 border-b border-border text-sm">
        {(["posts", "salon"] as const).map((k) => (
          <button key={k} onClick={() => setView(k)} className={`-mb-px border-b-2 pb-2 ${view === k ? "border-electric text-foreground" : "border-transparent text-muted-foreground"}`}>
            {k === "posts" ? (lang === "fr" ? "Publications" : "Posts") : (lang === "fr" ? "Salon en direct" : "Live room")}
          </button>
        ))}
      </div>
      {view === "salon" ? <Salon slug={slug} /> : <>
      <button onClick={() => setOpen(!open)} className="tap mt-5 w-full rounded-xl border border-electric/40 py-3 text-sm font-semibold text-electric">+ {t("new_post")}</button>
      {open && (
        <form className="mt-3 space-y-3 rounded-2xl glass p-4" onSubmit={(e) => {
          e.preventDefault(); if (!f.title.trim()) return;
          addPost(slug, f.title.trim(), f.body.trim(), f.tag); setF({ title: "", body: "", tag: "Question" }); setOpen(false); setSort("new"); setTag("all");
        }}>
          <label className="block text-sm">{t("post_title")}<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${field} mt-1.5`} /></label>
          <label className="block text-sm">{t("post_body")}<textarea rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`${field} mt-1.5`} /></label>
          <div className="flex gap-2">{POST_TAGS.map((x) => (
            <button type="button" key={x} onClick={() => setF({ ...f, tag: x })}
              className={`tap rounded-full border px-3 py-1.5 text-sm ${f.tag === x ? "border-electric bg-electric/15" : "border-border text-muted-foreground"}`}>{t(x)}</button>
          ))}</div>
          <button className="tap w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground glow-electric">{t("publish")}</button>
          <p className="text-xs text-muted-foreground">{t("local_only")}</p>
        </form>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", ...POST_TAGS] as const).map((x) => (
          <button key={x} onClick={() => setTag(x)}
            className={`tap rounded-full border px-3 py-1.5 text-sm ${tag === x ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground"}`}>{x === "all" ? t("all") : t(x)}</button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} aria-label="Sort"
          className="ml-auto rounded-xl border border-input bg-muted px-3 py-2 text-sm outline-none focus:border-electric">
          <option value="new">{t("sort_new")}</option><option value="top">{t("sort_top")}</option><option value="active">{t("sort_active")}</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {posts.map((p) => (
          <Link key={p.id} to="/community/$slug/$postId" params={{ slug, postId: p.id }} className="tap flex gap-3 rounded-2xl glass p-4">
            <VoteBox k={`${slug}/${p.id}`} base={p.votes} />
            <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className={`eyebrow ${tagCls[p.tag]}`}>{t(p.tag)}</span><SourceBadge isDemo={p.isDemo} /></div>
            <h3 className="mt-2 font-sans text-base font-semibold">{p.title}</h3>
            {p.body && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>}
            <p className="mt-3 text-xs text-muted-foreground">{p.author} · {p.at} · {p.replies.length} {t("replies")}</p>
            </div>
          </Link>
        ))}
        {!posts.length && <p className="py-10 text-center text-muted-foreground">{t("no_posts")}</p>}
      </div>
      </>}
    </div>
  );
}
