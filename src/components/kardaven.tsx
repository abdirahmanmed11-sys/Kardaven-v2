import bgImg from "@/assets/hero-sphere.jpg.asset.json";
import logoImg from "@/assets/logo-k.png";
import { AppMenu } from "./menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, PlusSquare, Bot, User, Plus, Briefcase, GraduationCap, Cpu, HeartPulse, Users2, Sparkles, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Problem, StepStatus } from "@/lib/data";
import { progressOf } from "@/lib/data";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoImg}
      alt=""
      width={size}
      height={size}
      draggable={false}
      aria-hidden
      className="select-none drop-shadow-[0_0_10px_var(--gold)]"
    />
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <Logo />
      <span className="font-display text-lg font-bold tracking-tight">KARD<span className="text-gradient-gold">AVEN</span></span>
    </Link>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex rounded-full border border-border p-0.5 font-mono text-[11px]">
      {(["en", "fr"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition ${lang === l ? "bg-gold text-gold-foreground" : "text-muted-foreground"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useI18n();
  const links = [
    { to: "/problems", label: t("nav_feed") },
    { to: "/community", label: t("nav_com") },
    { to: "/assistant", label: t("nav_ai") },
    { to: "/solve", label: t("nav_create") },
    { to: "/profile", label: t("nav_profile") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Wordmark />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition hover:text-foreground" activeProps={{ className: "text-foreground" }}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2"><Link to="/translate" aria-label="Translation" className="text-muted-foreground hover:text-foreground"><Sparkles className="h-4 w-4" /></Link><LangSwitch /><AppMenu /></div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const { t } = useI18n();
  const onJobs = useRouterState({ select: (s) => s.location.pathname.startsWith("/missions") });
  const links = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/community", label: t("nav_com"), icon: Users },
    { to: "/solve", label: t("nav_create"), icon: PlusSquare },
    { to: "/assistant", label: t("nav_ai"), icon: Bot },
    { to: "/profile", label: t("nav_profile"), icon: User },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/90 px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 backdrop-blur-xl md:hidden">
      {links.map((l) => l.to === "/solve" ? (
        <Link key={l.to} to="/solve" search={{ q: undefined }} aria-label={l.label} className="tap flex flex-col items-center">
          <span className="fab-center -mt-6 grid h-14 w-14 place-items-center rounded-full border-4 border-background bg-electric text-foreground">
            <Plus className="h-7 w-7" strokeWidth={2.4} />
          </span>
        </Link>
      ) : (
        <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }} className={`tap flex flex-col items-center gap-0.5 rounded-xl py-1 text-[10px] ${l.to === "/community" && onJobs ? "text-electric" : "text-muted-foreground"}`}
          activeProps={{ className: "text-electric [&>svg]:drop-shadow-[0_0_6px_var(--electric)]" }}>
          <l.icon className="h-5 w-5" strokeWidth={1.6} />{l.label}
        </Link>
      ))}
    </nav>
  );
}

export function Fab() {
  return (
    <Link to="/solve" search={{ q: undefined }} aria-label="Create"
      className="tap fixed bottom-20 right-4 z-40 hidden md:grid h-12 w-12 place-items-center rounded-2xl bg-electric text-primary-foreground glow-electric md:bottom-8 md:right-8">
      <Plus className="h-6 w-6" />
    </Link>
  );
}

export const CAT_ICON: Record<string, LucideIcon> = {
  Business: Briefcase, Education: GraduationCap, Technology: Cpu, Health: HeartPulse, Community: Users2, Personal: Sparkles,
};
export const CAT_TINT: Record<string, string> = {
  Business: "from-gold/80 to-gold/30", Education: "from-electric/80 to-electric/30", Technology: "from-electric to-primary/40",
  Health: "from-success/80 to-success/30", Community: "from-destructive/70 to-gold/40", Personal: "from-gold/70 to-electric/40",
};
export function CatIcon({ cat, className = "h-9 w-9" }: { cat: string; className?: string }) {
  const I = CAT_ICON[cat] ?? Sparkles;
  return <span className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br ${CAT_TINT[cat] ?? "from-muted to-muted"} ${className}`}><I className="h-1/2 w-1/2 text-background" strokeWidth={2} /></span>;
}

export function Avatar({ name, className = "h-9 w-9" }: { name: string; className?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full border border-electric/40 bg-accent font-display text-xs font-semibold text-electric ${className}`}>{name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>;
}

export function SourceBadge({ isDemo }: { isDemo: boolean }) {
  const { t } = useI18n();
  return isDemo ? (
    <span className="eyebrow rounded-full border border-border px-2 py-0.5 !text-[9px] text-muted-foreground">{t("demo")}</span>
  ) : (
    <span className="eyebrow rounded-full border border-gold/50 px-2 py-0.5 !text-[9px] text-gold">{t("yours")}</span>
  );
}

export function StatusPill({ status }: { status: StepStatus }) {
  const { t } = useI18n();
  const cls = status === "done" ? "bg-success/15 text-success" : status === "doing" ? "bg-electric/15 text-electric" : "bg-muted text-muted-foreground";
  return <span className={`eyebrow shrink-0 rounded-full px-2 py-0.5 !text-[9px] ${cls}`}>{t(status)}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-gradient-to-r from-electric to-gold transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

export function ProblemCard({ p }: { p: Problem }) {
  const { t } = useI18n();
  return (
    <Link to="/problems/$id" params={{ id: p.id }} className="lift group block rounded-2xl glass p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="eyebrow text-electric">{p.category}</span>
        <SourceBadge isDemo={p.isDemo} />
        {p.verified && <span className="eyebrow !text-[9px] text-gold">✦ {t("verified")}</span>}
      </div>
      <h3 className="font-sans text-base font-semibold leading-snug group-hover:text-foreground">{p.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{p.author}</span><span>·</span><span>{p.replies.length} {t("replies")}</span>
        <div className="ml-auto w-20"><ProgressBar value={progressOf(p)} /></div>
      </div>
    </Link>
  );
}

/** One fixed background image: no moving layers, so page switches stay instant. */
export function SpaceBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <img src={bgImg.url} alt="" width={1024} height={1024} decoding="async" className="h-full w-full object-cover object-center opacity-60" />
      <div className="absolute inset-0 bg-background/55" />
    </div>
  );
}

/** KARDAVEN verified mark: a gold-and-electric eight-point star with a check, given to community founders. */
export function VerifiedBadge({ className = "h-4 w-4", title = "Verified" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`inline-block shrink-0 drop-shadow-[0_0_4px_var(--gold)] ${className}`} role="img" aria-label={title}>
      <title>{title}</title>
      <defs><linearGradient id="kv-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--gold)" /><stop offset="1" stopColor="var(--electric)" /></linearGradient></defs>
      <path fill="url(#kv-g)" d="M12 1l2.6 3.1 4-.6.6 4 3.1 2.5-3.1 2.5-.6 4-4-.6L12 19l-2.6-3.1-4 .6-.6-4L1.7 10l3.1-2.5.6-4 4 .6z" transform="translate(0 2)" />
      <path d="M8.2 12.3l2.6 2.5 5-5.2" fill="none" stroke="var(--background)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CommunityAvatar({ c, className = "h-11 w-11" }: { c: { avatar?: string | undefined; category: string; name: string }; className?: string }) {
  return c.avatar
    ? <img src={c.avatar} alt={c.name} className={`shrink-0 rounded-xl object-cover ${className}`} />
    : <CatIcon cat={c.category} className={className} />;
}

export function KardavenHeader() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-electric/50 bg-accent glow-electric">
        <span className="absolute inset-0 rounded-full border border-dashed border-electric/40 animate-orbit" /><Logo size={30} />
      </span>
      <div><p className="font-sans font-bold">{t("ai_name")}</p><p className="text-xs text-muted-foreground">{t("ai_role")}</p></div>
    </div>
  );
}
