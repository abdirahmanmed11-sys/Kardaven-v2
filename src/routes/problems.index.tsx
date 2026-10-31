import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { allProblems, CATEGORIES, useStore } from "@/lib/data";
import { ProblemCard } from "@/components/kardaven";

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Problem Feed — KARDAVEN" },
      { name: "description", content: "Browse problems, discussions and action plans shared on KARDAVEN." },
      { property: "og:title", content: "Problem Feed — KARDAVEN" },
      { property: "og:description", content: "Search problems by category and see how people solve them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { t } = useI18n();
  const st = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const list = useMemo(() => allProblems(st).filter((p) =>
    (cat === "all" || p.category === cat) && (p.title + p.description).toLowerCase().includes(q.toLowerCase())), [st, q, cat]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-semibold">{t("feed_title")}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t("demo_note")}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_ph")} type="search"
        className="mt-5 w-full rounded-xl border border-input bg-muted/40 px-4 py-3 text-base outline-none focus:border-electric" />
      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {["all", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${cat === c ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground"}`}>
            {c === "all" ? t("all") : c}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {list.map((p) => <ProblemCard key={p.id} p={p} />)}
        {!list.length && <p className="py-10 text-center text-muted-foreground">{t("no_results")}</p>}
      </div>
    </div>
  );
}
