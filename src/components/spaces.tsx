import { Link } from "@tanstack/react-router";
import { ChevronUp, ChevronDown, BadgeCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { myVote, useExtra, vote } from "@/lib/community";

/** Communities and Missions share one place: this switch sits on top of both. */
export function SpaceSwitch({ active }: { active: "com" | "jobs" }) {
  const { lang } = useI18n();
  const cls = (on: boolean) => `flex-1 rounded-full py-2 text-center text-sm font-semibold ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`;
  return (
    <div className="flex rounded-full border border-border bg-muted/60 p-1">
      <Link to="/community" className={cls(active === "com")}>{lang === "fr" ? "Communautés" : "Communities"}</Link>
      <Link to="/missions" className={cls(active === "jobs")}>{lang === "fr" ? "Missions / Gigs" : "Missions / Gigs"}</Link>
    </div>
  );
}

export function VoteBox({ k, base, row = false }: { k: string; base: number; row?: boolean }) {
  const x = useExtra(); const v = myVote(x, k);
  const stop = (e: React.MouseEvent, d: 1 | -1) => { e.preventDefault(); e.stopPropagation(); vote(k, d); };
  return (
    <div className={`flex items-center ${row ? "flex-row gap-1" : "flex-col"} text-xs`}>
      <button aria-label="Upvote" onClick={(e) => stop(e, 1)} className={`tap rounded p-0.5 ${v === 1 ? "text-gold" : "text-muted-foreground"}`}><ChevronUp className="h-5 w-5" /></button>
      <span className={`font-semibold ${v ? "text-gold" : ""}`}>{base + v}</span>
      <button aria-label="Downvote" onClick={(e) => stop(e, -1)} className={`tap rounded p-0.5 ${v === -1 ? "text-electric" : "text-muted-foreground"}`}><ChevronDown className="h-5 w-5" /></button>
    </div>
  );
}

export function FreelanceBadge({ className = "h-4 w-4" }: { className?: string }) {
  const { lang } = useI18n();
  const label = lang === "fr" ? "Freelance vérifié" : "Verified freelancer";
  return <span title={label} role="img" aria-label={label} className="inline-flex"><BadgeCheck className={`shrink-0 text-success ${className}`} /></span>;
}
