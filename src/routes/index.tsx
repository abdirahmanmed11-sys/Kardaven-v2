import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, CheckCircle2, Search, MoreHorizontal, TrendingUp } from "lucide-react";
import hero from "@/assets/hero-sphere.jpg.asset.json";
import { useI18n } from "@/lib/i18n";
import { allProblems, CATEGORIES, progressOf, useStore } from "@/lib/data";
import { Avatar, CatIcon, Fab, Logo, SourceBadge } from "@/components/kardaven";
import { allCommunities, useCommunityStore } from "@/lib/community";
import { Eye, Flame } from "lucide-react";

/* Sample view counts derived from the item id + activity (no real analytics yet). */
const viewsOf = (id: string, votes: number, replies: number) => {
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 300 + h * 3 + votes * 45 + replies * 120;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KARDAVEN — From Problem to Progress" },
      { name: "description", content: "KARDAVEN: an AI-powered platform where people and AI turn problems into practical results." },
      { property: "og:title", content: "KARDAVEN — One Platform. Many Possibilities." },
      { property: "og:description", content: "People and AI working together to turn problems into practical results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const nav = useNavigate();
  const st = useStore();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const list = useMemo(() => allProblems(st).filter((p) =>
    (cat === "all" || p.category === cat) && (p.title + p.description).toLowerCase().includes(q.toLowerCase())), [st, q, cat]);
  const tiles = ["all", ...CATEGORIES.slice(0, 5)];
  const cs = useCommunityStore();
  const top10 = useMemo(() => {
    const items = [
      ...allProblems(st).map((p) => ({ key: "p" + p.id, title: p.title, cat: p.category, views: viewsOf(p.id, 0, p.replies.length), link: { to: "/problems/$id" as const, params: { id: p.id } } })),
      ...allCommunities(cs).flatMap((c) => c.posts.map((po) => ({ key: c.slug + po.id, title: po.title, cat: c.name, views: viewsOf(c.slug + po.id, po.votes, po.replies.length), link: { to: "/community/$slug/$postId" as const, params: { slug: c.slug, postId: po.id } } }))),
    ];
    return items.sort((a, b) => b.views - a.views).slice(0, 10);
  }, [st, cs]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <section className="relative mx-4 mt-4 overflow-hidden rounded-3xl border border-border">
        <img src={hero.url} alt="" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background/90" />
        <div className="relative px-5 pb-5 pt-8 text-center">
          <div className="mx-auto mb-3 grid place-items-center"><Logo size={48} /></div>
          <p className="font-display text-2xl font-bold">KARD<span className="text-gradient-gold">AVEN</span></p>
          <p className="eyebrow mt-1 !text-[9px] text-muted-foreground">{t("hero_sub")}</p>
          <h1 className="mt-4 text-xl font-semibold leading-tight text-gradient-electric md:text-3xl">{t("hero_title")}</h1>
          <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/solve", search: { q: text } }); }}
            className="mx-auto mt-5 max-w-md rounded-2xl glass ai-border p-3 text-left">
            <label htmlFor="q" className="eyebrow flex items-center gap-2 text-electric"><span className="h-2 w-2 rounded-full bg-electric animate-pulse-glow" />{t("ai_prompt_label")}</label>
            <textarea id="q" value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={t("ai_prompt_ph")}
              className="mt-1 w-full resize-none bg-transparent text-sm outline-none" />
            <button type="submit" className="tap w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground glow-gold">{t("cta_solve")}</button>
          </form>
        </div>
      </section>

      {/* Search */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/60 px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home_search")} type="search" className="w-full bg-transparent text-sm outline-none" />
        </div>
        {/* Category tiles */}
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {tiles.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="tap flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
              {c === "all"
                ? <span className={`grid h-11 w-11 place-items-center rounded-xl ${cat === c ? "bg-primary text-primary-foreground glow-gold" : "border border-border bg-muted"}`}><TrendingUp className="h-5 w-5" /></span>
                : <span className={`rounded-xl ${cat === c ? "ring-2 ring-gold" : ""}`}><CatIcon cat={c} className="h-11 w-11" /></span>}
              <span className={cat === c ? "text-gold" : ""}>{c === "all" ? t("tab_all") : c.slice(0, 9)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 10 */}
      <section className="px-4 pt-6">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold"><Flame className="h-5 w-5 text-gold" />{t("top10")}</h2>
        <p className="text-xs text-muted-foreground">{t("top10_sub")} · {t("demo")}</p>
        <div className="mt-3 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {top10.map((it, i) => (
            <Link key={it.key} {...(it.link as any)} className="tap relative flex w-60 shrink-0 snap-start flex-col rounded-2xl glass p-4">
              <span className={`font-display text-3xl font-bold ${i < 3 ? "text-gradient-gold" : "text-muted-foreground"}`}>{i + 1}</span>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{it.title}</p>
              <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-muted-foreground">
                <span className="truncate text-electric">{it.cat}</span>
                <span className="ml-auto flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{it.views.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="px-4 pb-10 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-bold">{t("for_you")}</h2>
          <Link to="/problems" className="text-xs text-electric">{t("cta_explore")} →</Link>
        </div>
        <div className="mt-3 space-y-3">
          {list.map((p) => (
            <Link key={p.id} to="/problems/$id" params={{ id: p.id }} className="lift block rounded-2xl glass p-4">
              <div className="flex items-center gap-2.5">
                <Avatar name={p.author} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.author}</p>
                  <p className="text-[11px] text-muted-foreground">{p.at}</p>
                </div>
                <span className="rounded-full border border-electric/40 px-2 py-0.5 text-[10px] text-electric">{p.category}</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="mt-3 font-sans text-[15px] font-semibold leading-snug">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="text-gold">◆ {progressOf(p)}%</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{p.replies.length}</span>
                <SourceBadge isDemo={p.isDemo} />
                {p.verified && <span className="ml-auto flex items-center gap-1 text-gold"><CheckCircle2 className="h-3.5 w-3.5" />{t("solution")}</span>}
              </div>
            </Link>
          ))}
          {!list.length && <p className="py-10 text-center text-muted-foreground">{t("no_results")}</p>}
        </div>
      </section>
      <Fab />
    </div>
  );
}
