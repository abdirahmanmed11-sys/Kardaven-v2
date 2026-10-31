import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Settings, Mail, Info, HelpCircle, Shield, FileText, Languages, User, Briefcase } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PAGES } from "@/lib/pages";

/** Three-bar menu: instant open/close, no animation. */
export function AppMenu() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const P = PAGES[lang];
  const items = [
    { to: "/profile", label: lang === "fr" ? "Profil" : "Profile", icon: User },
    { to: "/missions", label: "Missions / Gigs", icon: Briefcase },
    { to: "/settings", label: P.settings.title, icon: Settings },
    { to: "/translate", label: lang === "fr" ? "Traduction" : "Translation", icon: Languages },
    { to: "/help", label: P.help.title, icon: HelpCircle },
    { to: "/contact", label: P.contact.title, icon: Mail },
    { to: "/about", label: P.about.title, icon: Info },
    { to: "/privacy", label: P.privacy.title, icon: Shield },
    { to: "/terms", label: P.terms.title, icon: FileText },
  ] as const;
  return (
    <>
      <button aria-label="Menu" onClick={() => setOpen(true)} className="tap grid h-9 w-9 place-items-center rounded-full text-foreground"><Menu className="h-5 w-5" /></button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/70" onClick={() => setOpen(false)} />
          <nav className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-border bg-card p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-bold">Menu</p>
              <button aria-label="Close" onClick={() => setOpen(false)} className="tap grid h-9 w-9 place-items-center rounded-full"><X className="h-5 w-5" /></button>
            </div>
            {items.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="tap flex items-center gap-3 rounded-xl px-3 py-3 text-sm active:bg-muted" activeProps={{ className: "text-gold" }}>
                <Icon className="h-5 w-5" />{label}
              </Link>
            ))}
            <p className="mt-auto text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground">KARDAVEN · v0.1</p>
          </nav>
        </div>
      )}
    </>
  );
}

export function InfoPage({ page }: { page: keyof typeof PAGES.en }) {
  const { lang } = useI18n();
  const p = PAGES[lang][page];
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">{p.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{p.intro}</p>
      <div className="mt-5 space-y-3">
        {p.blocks.map((b) => (
          <div key={b.h} className="rounded-2xl glass p-4">
            <h2 className="font-sans text-sm font-semibold">{b.h}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{b.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
