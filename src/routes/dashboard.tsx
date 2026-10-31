import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { progressOf, useStore } from "@/lib/data";
import { ProgressBar } from "@/components/kardaven";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KARDAVEN" },
      { name: "description", content: "Track progress on your action plans in KARDAVEN." },
      { property: "og:title", content: "Dashboard — KARDAVEN" },
      { property: "og:description", content: "Your problems and action plan progress in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const { problems } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-semibold">{t("dash_title")}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t("local_note")}</p>
      {!problems.length ? (
        <div className="mt-8 rounded-2xl glass grid-bg p-8 text-center">
          <p className="text-muted-foreground">{t("dash_empty")}</p>
          <Link to="/solve" search={{ q: undefined }} className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground glow-electric">{t("cta_solve")}</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {problems.map((p) => {
            const pct = progressOf(p);
            const done = p.steps.filter((s) => s.status === "done").length;
            return (
              <Link key={p.id} to="/problems/$id" params={{ id: p.id }} className="block rounded-2xl glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="eyebrow text-electric">{p.category}</p><p className="mt-1 font-semibold">{p.title}</p></div>
                  <span className="font-display text-2xl text-gradient-gold">{pct}%</span>
                </div>
                <div className="mt-3"><ProgressBar value={pct} /></div>
                <p className="mt-2 text-xs text-muted-foreground">{done}/{p.steps.length} {t("steps_done")}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
