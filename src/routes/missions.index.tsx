import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Star, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { addGig, addProject, allGigs, allProjects, moveContract, useFreelance, type ContractStatus } from "@/lib/freelance";
import { FreelanceBadge, SpaceSwitch } from "@/components/spaces";
import { Avatar, SourceBadge } from "@/components/kardaven";

export const Route = createFileRoute("/missions/")({
  head: () => ({
    meta: [
      { title: "Missions & Gigs — KARDAVEN" },
      { name: "description", content: "Hire freelancers or post a project on KARDAVEN, with protected payments." },
      { property: "og:title", content: "Missions & Gigs — KARDAVEN" },
      { property: "og:description", content: "Freelancers list their skills, clients post projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Missions,
});

type Tab = "gigs" | "projects" | "contracts";
export const STATUS_LABEL: Record<ContractStatus, { en: string; fr: string; cls: string }> = {
  funded: { en: "Funds held", fr: "Argent bloqué", cls: "text-gold" },
  delivered: { en: "Work delivered", fr: "Travail livré", cls: "text-electric" },
  released: { en: "Paid to freelancer", fr: "Versé au freelance", cls: "text-success" },
  refunded: { en: "Refunded", fr: "Remboursé", cls: "text-muted-foreground" },
};

function Missions() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const s = useFreelance();
  const [tab, setTab] = useState<Tab>("gigs");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", body: "", price: "", skills: "" });
  const field = "w-full rounded-xl border border-input bg-muted/40 px-3.5 py-3 text-base outline-none focus:border-electric";
  const tabs: [Tab, string][] = [["gigs", fr ? "Freelances" : "Gigs"], ["projects", fr ? "Projets clients" : "Client projects"], ["contracts", fr ? "Mes contrats" : "My contracts"]];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <SpaceSwitch active="jobs" />
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-bold">{fr ? "Missions / Gigs" : "Missions / Gigs"}</h1>
        {tab !== "contracts" && <button onClick={() => setOpen(!open)} className="tap flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" />{tab === "gigs" ? (fr ? "Proposer un service" : "Offer a service") : (fr ? "Poster un projet" : "Post a project")}</button>}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" />{fr ? "Paiement protégé : l'argent est bloqué jusqu'à ce que le client valide le travail. (Simulé — aucun vrai paiement)" : "Protected payment: money is held until the client approves the work. (Simulated — no real payment)"}</p>

      <div className="mt-4 flex gap-5 border-b border-border text-sm">
        {tabs.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setOpen(false); }} className={`-mb-px border-b-2 pb-2 ${tab === k ? "border-electric text-foreground" : "border-transparent text-muted-foreground"}`}>{l}</button>)}
      </div>

      {open && (
        <form className="mt-4 space-y-3 rounded-2xl glass p-4" onSubmit={(e) => {
          e.preventDefault(); const n = Number(f.price); if (!f.title.trim() || !(n > 0)) return;
          const sk = f.skills.split(",").map((x) => x.trim()).filter(Boolean);
          if (tab === "gigs") addGig(f.title.trim(), f.body.trim(), n, sk); else addProject(f.title.trim(), f.body.trim(), n, sk);
          setF({ title: "", body: "", price: "", skills: "" }); setOpen(false);
        }}>
          <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={tab === "gigs" ? (fr ? "Ex : Je résous vos bugs de code" : "e.g. I fix your code bugs") : (fr ? "Ex : Site vitrine pour mon café" : "e.g. Website for my café")} className={field} />
          <textarea rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder={fr ? "Détails" : "Details"} className={field} />
          <div className="flex gap-2">
            <input required inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder={tab === "gigs" ? (fr ? "Prix $" : "Price $") : (fr ? "Budget $" : "Budget $")} className={field} />
            <input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder={fr ? "Compétences (virgules)" : "Skills (commas)"} className={field} />
          </div>
          <button className="tap w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">{fr ? "Publier" : "Publish"}</button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {tab === "gigs" && allGigs(s).map((g) => (
          <Link key={g.id} to="/missions/$id" params={{ id: g.id }} className="tap block rounded-2xl glass p-4">
            <div className="flex items-center gap-2.5"><Avatar name={g.author} />
              <p className="flex items-center gap-1 text-sm font-semibold">{g.author}{g.verified && <FreelanceBadge />}</p>
              {g.rating > 0 && <span className="flex items-center gap-0.5 text-xs text-gold"><Star className="h-3.5 w-3.5 fill-current" />{g.rating}</span>}
              <span className="ml-auto font-display text-lg font-bold text-gold">{g.price}$</span></div>
            <h3 className="mt-2 font-sans text-[15px] font-semibold">{g.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">{g.skills.map((k) => <span key={k} className="rounded-full border border-electric/40 px-2 py-0.5 text-[10px] text-electric">{k}</span>)}<SourceBadge isDemo={g.isDemo} /></div>
          </Link>
        ))}
        {tab === "projects" && allProjects(s).map((j) => (
          <Link key={j.id} to="/missions/$id" params={{ id: j.id }} className="tap block rounded-2xl glass p-4">
            <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{j.author} · {j.at}</span><span className="ml-auto font-display text-lg font-bold text-gold">{j.budget}$</span></div>
            <h3 className="mt-1 font-sans text-[15px] font-semibold">{j.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">{j.skills.map((k) => <span key={k} className="rounded-full border border-electric/40 px-2 py-0.5 text-[10px] text-electric">{k}</span>)}<SourceBadge isDemo={j.isDemo} /></div>
          </Link>
        ))}
        {tab === "contracts" && (s.contracts.length ? s.contracts.map((c) => {
          const st = STATUS_LABEL[c.status]; const iAmClient = c.client === "You";
          return (
            <div key={c.id} className="rounded-2xl glass p-4">
              <div className="flex items-center gap-2"><span className={`text-xs font-semibold ${st.cls}`}>● {fr ? st.fr : st.en}</span><span className="ml-auto font-display text-lg font-bold">{c.amount}$</span></div>
              <h3 className="mt-1 text-sm font-semibold">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{fr ? "Client" : "Client"} : {c.client === "You" ? (fr ? "Vous" : "You") : c.client} · Freelance : {c.freelancer === "You" ? (fr ? "Vous" : "You") : c.freelancer}</p>
              <div className="mt-3 flex gap-2">
                {c.status === "funded" && !iAmClient && <button onClick={() => moveContract(c.id, "delivered")} className="tap flex-1 rounded-xl bg-electric py-2.5 text-sm font-semibold text-primary-foreground">{fr ? "Livrer le travail" : "Deliver work"}</button>}
                {c.status === "funded" && iAmClient && <button onClick={() => moveContract(c.id, "delivered")} className="tap flex-1 rounded-xl border border-border py-2.5 text-xs text-muted-foreground">{fr ? "(Démo) Le freelance livre" : "(Demo) Freelancer delivers"}</button>}
                {c.status === "delivered" && iAmClient && <button onClick={() => moveContract(c.id, "released")} className="tap flex-1 rounded-xl bg-success py-2.5 text-sm font-semibold text-primary-foreground">{fr ? "Valider et payer" : "Approve & pay"}</button>}
                {c.status === "delivered" && !iAmClient && <button onClick={() => moveContract(c.id, "released")} className="tap flex-1 rounded-xl border border-border py-2.5 text-xs text-muted-foreground">{fr ? "(Démo) Le client valide" : "(Demo) Client approves"}</button>}
                {(c.status === "funded" || c.status === "delivered") && iAmClient && <button onClick={() => moveContract(c.id, "refunded")} className="tap rounded-xl border border-destructive/50 px-3 py-2.5 text-xs text-destructive">{fr ? "Rembourser" : "Refund"}</button>}
              </div>
            </div>
          );
        }) : <p className="py-10 text-center text-sm text-muted-foreground">{fr ? "Aucun contrat. Engagez un freelance ou postulez à un projet." : "No contracts yet. Hire a freelancer or apply to a project."}</p>)}
      </div>
    </div>
  );
}
