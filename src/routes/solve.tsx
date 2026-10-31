import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n, type TKey } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { addProblem, CATEGORIES, type Category } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { analyzeProblem } from "@/lib/kardaven.functions";

export const Route = createFileRoute("/solve")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  head: () => ({
    meta: [
      { title: "Solve a Problem — KARDAVEN" },
      { name: "description", content: "Describe your problem, goal, constraints and attempts to get an action plan on KARDAVEN." },
      { property: "og:title", content: "Solve a Problem — KARDAVEN" },
      { property: "og:description", content: "Turn your problem into a step-by-step action plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Solve,
});

const field = "w-full rounded-xl border border-input bg-muted/40 px-3.5 py-3 text-base outline-none transition focus:border-electric focus:glow-electric";

function Solve() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const analyze = useServerFn(analyzeProblem);
  const { q } = Route.useSearch();
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", category: "Business" as Category, description: q ?? "", goal: "", constraints: "", tried: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let analysis;
    if (user) {
      try { analysis = await analyze({ data: { ...f, lang } }); }
      catch (err) { toast.error(lang === "fr" ? "Kardaven n'a pas pu analyser, plan simulé utilisé." : "Kardaven couldn't analyse, using a simulated plan."); console.error(err); }
    }
    const id = addProblem(f, analysis);
    nav({ to: "/problems/$id", params: { id } });
  };

  const area = (k: "description" | "goal" | "constraints" | "tried", label: TKey, req = false) => (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-medium">{t(label)}{req && <span className="eyebrow !text-[9px] text-gold">{t("required")}</span>}</span>
      <textarea required={req} rows={k === "description" ? 4 : 2} value={f[k]} onChange={set(k)} className={field} />
    </label>
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="eyebrow text-electric">◆ KARDAVEN</p>
      <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{t("form_title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("form_sub")}</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-medium">{t("f_title")}<span className="eyebrow !text-[9px] text-gold">{t("required")}</span></span>
          <input required value={f.title} onChange={set("title")} className={field} />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-medium">{t("f_cat")}</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} onClick={() => setF({ ...f, category: c })}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${f.category === c ? "border-electric bg-electric/15 text-foreground" : "border-border text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
        {area("description", "f_desc", true)}
        {area("goal", "f_goal", true)}
        {area("constraints", "f_cons")}
        {area("tried", "f_tried")}
        <button disabled={busy} className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground glow-electric transition active:scale-[.98] disabled:opacity-70">
          {busy ? (lang === "fr" ? "Kardaven analyse votre problème…" : "Kardaven is analysing…") : t("submit")}
        </button>
        <p className="text-center text-xs text-muted-foreground">{user ? (lang === "fr" ? "Analyse par Kardaven (IA)." : "Analysis by Kardaven (AI).") : (lang === "fr" ? "Connectez-vous pour une analyse IA réelle — sinon plan simulé." : "Sign in for a real AI analysis — otherwise a simulated plan.")} {t("local_note")}</p>
      </form>
    </div>
  );
}
