import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { findItem, hire, useFreelance } from "@/lib/freelance";
import { FreelanceBadge } from "@/components/spaces";
import { Avatar, SourceBadge } from "@/components/kardaven";
import { toast } from "sonner";

export const Route = createFileRoute("/missions/$id")({
  head: () => ({
    meta: [
      { title: "Mission — KARDAVEN" },
      { name: "description", content: "Freelance service or client project on KARDAVEN." },
      { property: "og:title", content: "Mission — KARDAVEN" },
      { property: "og:description", content: "Hire with protected payment on KARDAVEN." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { id } = Route.useParams();
  const { lang } = useI18n(); const fr = lang === "fr";
  const s = useFreelance(); const nav = useNavigate();
  const it = findItem(s, id);
  if (!it) return <div className="py-20 text-center text-muted-foreground">—  <Link to="/missions" className="text-electric">←</Link></div>;
  const amount = it.kind === "gig" ? it.price : it.budget;
  const mine = it.author === "You";
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/missions" className="text-sm text-muted-foreground">← Missions</Link>
      <article className="mt-4 rounded-2xl glass p-5">
        <div className="flex items-center gap-2.5"><Avatar name={it.author} />
          <p className="flex items-center gap-1 font-semibold">{it.author === "You" ? (fr ? "Vous" : "You") : it.author}{it.kind === "gig" && it.verified && <FreelanceBadge />}</p>
          {it.kind === "gig" && it.rating > 0 && <span className="flex items-center gap-0.5 text-xs text-gold"><Star className="h-3.5 w-3.5 fill-current" />{it.rating}</span>}
          <SourceBadge isDemo={it.isDemo} /></div>
        <h1 className="mt-3 font-sans text-xl font-semibold">{it.title}</h1>
        <p className="mt-2 text-muted-foreground">{it.body}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{it.skills.map((k) => <span key={k} className="rounded-full border border-electric/40 px-2 py-0.5 text-[11px] text-electric">{k}</span>)}</div>
        <p className="mt-4 font-display text-3xl font-bold text-gold">{amount}$</p>
      </article>
      <div className="mt-4 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-success"><ShieldCheck className="h-4 w-4" />{fr ? "Contrat sécurisé" : "Secure contract"}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>{fr ? "Le client paie : l'argent est bloqué par KARDAVEN." : "Client pays: KARDAVEN holds the money."}</li>
          <li>{fr ? "Le freelance livre le travail." : "Freelancer delivers the work."}</li>
          <li>{fr ? "Le client valide : l'argent est versé au freelance." : "Client approves: money is released to the freelancer."}</li>
        </ol>
        <p className="mt-2 text-[11px] text-gold">{fr ? "Simulé — aucun vrai paiement n'est encore connecté." : "Simulated — no real payment connected yet."}</p>
      </div>
      {!mine && (
        <button onClick={() => { hire(it.id); toast.success(fr ? "Contrat créé · argent bloqué (simulé)" : "Contract created · funds held (simulated)"); nav({ to: "/missions" }); }}
          className="tap mt-4 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground">
          {it.kind === "gig" ? (fr ? `Engager pour ${amount}$` : `Hire for ${amount}$`) : (fr ? "Accepter ce projet" : "Accept this project")}
        </button>
      )}
    </div>
  );
}
