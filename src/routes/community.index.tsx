import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { isJoined, toggleJoin, topLevel, useCommunityStore } from "@/lib/community";
import { CommunityAvatar, VerifiedBadge } from "@/components/kardaven";
import { SpaceSwitch } from "@/components/spaces";

export const Route = createFileRoute("/community/")({
  head: () => ({
    meta: [
      { title: "Communities — KARDAVEN" },
      { name: "description", content: "Explore sample KARDAVEN communities by category and join discussions." },
      { property: "og:title", content: "Communities — KARDAVEN" },
      { property: "og:description", content: "Find people working on problems like yours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Communities,
});

type Tab = "all" | "mine" | "popular";

function Communities() {
  const { t } = useI18n();
  const st = useCommunityStore();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const list = useMemo(() => {
    let l = topLevel(st).filter((c) => (c.name + c.tagline + c.category).toLowerCase().includes(q.toLowerCase()));
    if (tab === "mine") l = l.filter((c) => isJoined(st, c.slug));
    if (tab === "popular") l = [...l].sort((a, b) => b.members - a.members);
    return l;
  }, [q, tab, st]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <SpaceSwitch active="com" />
      <div className="mt-4 flex items-center justify-between"><h1 className="font-sans text-xl font-bold">{t("com_title")}</h1>
        <Link to="/community/new" search={{ parent: undefined, edit: undefined }} className="tap flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" />{t("cc_new")}</Link></div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-input bg-muted/60 px-3.5 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("com_search")} type="search" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="mt-4 flex gap-5 border-b border-border text-sm">
        {(["all", "mine", "popular"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 pb-2 transition ${tab === k ? "border-electric text-foreground" : "border-transparent text-muted-foreground"}`}>
            {t(k === "all" ? "tab_all" : k === "mine" ? "tab_mine" : "tab_popular")}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-gold/90">{t("com_demo_note")}</p>

      <div className="mt-3 divide-y divide-border rounded-2xl glass">
        {list.map((c) => {
          const joined = isJoined(st, c.slug);
          return (
            <div key={c.slug} className="flex items-center gap-3 p-3.5">
              <CommunityAvatar c={c} />
              <Link to="/community/$slug" params={{ slug: c.slug }} className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">{c.name}<VerifiedBadge className="h-3.5 w-3.5" /></p>
                <p className="text-xs text-muted-foreground">{(c.members + (joined ? 1 : 0)).toLocaleString()} {t("members")} · {c.founder}</p>
              </Link>
              <button onClick={() => toggleJoin(c.slug)} aria-pressed={joined}
                className={`tap flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${joined ? "border-gold/50 text-gold" : "border-electric/50 text-electric"}`}>
                {joined ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{joined ? t("joined") : t("join")}
              </button>
            </div>
          );
        })}
        {!list.length && <p className="p-8 text-center text-sm text-muted-foreground">{tab === "mine" ? t("no_mine") : t("no_results")}</p>}
      </div>
    </div>
  );
}
