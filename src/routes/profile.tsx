import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Crown, Languages, LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { allProblems, progressOf, useStore } from "@/lib/data";
import { useCommunityStore } from "@/lib/community";
import { Avatar, Logo, ProgressBar } from "@/components/kardaven";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — KARDAVEN" },
      { name: "description", content: "Your KARDAVEN posts, replies and communities." },
      { property: "og:title", content: "Your Profile — KARDAVEN" },
      { property: "og:description", content: "Posts, replies and communities in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { t } = useI18n();
  const { user } = useAuth();
  const st = useStore();
  const cs = useCommunityStore();
  const badges = useQuery({
    queryKey: ["badges", user?.id], enabled: !!user,
    queryFn: async () => { const { data } = await supabase.from("user_badges").select("badge").eq("user_id", user!.id); return (data ?? []).map((b) => b.badge); },
  });
  const has = (b: string) => badges.data?.includes(b) ?? false;
  const [tab, setTab] = useState<"posts" | "replies" | "about">("posts");
  const mine = st.problems;
  const myReplies = allProblems(st).flatMap((p) => p.replies.filter((r) => !r.isDemo).map((r) => ({ ...r, p })));
  const stats = [[mine.length, "p_posts"], [myReplies.length, "p_replies"], [cs.joined.length, "p_coms"]] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-4">
        <span className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-electric/60 bg-accent glow-electric"><Logo size={40} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-lg font-bold">{user?.user_metadata?.["full_name"] || t("you")}</p>
          <p className="truncate text-xs text-muted-foreground">{user ? user.email : t("p_guest")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {has("verified") && <span className="inline-flex items-center gap-1 rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-semibold text-electric"><BadgeCheck className="h-3 w-3" />{t("verified")}</span>}
            {has("founder") && <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold glow-gold"><Crown className="h-3 w-3" />Fondateur KARDAVEN</span>}
            {!has("verified") && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t("p_active")}</span>}
          </div>
        </div>
        {user
          ? <button onClick={() => supabase.auth.signOut()} className="tap rounded-xl border border-border px-3 py-2 text-xs">{t("au_out")}</button>
          : <Link to="/auth" className="tap rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">{t("au_signin")}</Link>}
      </div>
      <div className="mt-5 grid grid-cols-3 text-center">
        {stats.map(([n, k]) => <div key={k}><p className="font-display text-xl font-bold">{n}</p><p className="text-[11px] text-muted-foreground">{t(k)}</p></div>)}
      </div>
      <p className="mt-4 text-sm">{t("p_bio")}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to="/translate" className="tap flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 py-2.5 text-sm"><Languages className="h-4 w-4" />{t("p_edit")}</Link>
        <Link to="/dashboard" className="tap flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 py-2.5 text-sm"><LayoutDashboard className="h-4 w-4" />{t("nav_dash")}</Link>
      </div>

      <div className="mt-6 grid grid-cols-3 border-b border-border text-center text-sm">
        {(["posts", "replies", "about"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-2 ${tab === k ? "border-electric text-foreground" : "border-transparent text-muted-foreground"}`}>
            {t(k === "posts" ? "p_posts" : k === "replies" ? "p_replies" : "p_about")}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tab === "posts" && (mine.length ? mine.map((p) => (
          <Link key={p.id} to="/problems/$id" params={{ id: p.id }} className="lift block rounded-2xl glass p-4">
            <div className="flex items-center gap-2"><Avatar name="You" className="h-7 w-7" /><span className="text-xs text-muted-foreground">{p.at}</span><span className="ml-auto rounded-full border border-electric/40 px-2 py-0.5 text-[10px] text-electric">{p.category}</span></div>
            <p className="mt-2 font-semibold">{p.title}</p>
            <div className="mt-3"><ProgressBar value={progressOf(p)} /></div>
          </Link>
        )) : (
          <div className="rounded-2xl glass p-6 text-center text-sm text-muted-foreground">{t("dash_empty")}
            <Link to="/solve" search={{ q: undefined }} className="mt-4 block rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground">{t("cta_solve")}</Link>
          </div>
        ))}
        {tab === "replies" && (myReplies.length ? myReplies.map((r) => (
          <Link key={r.id} to="/problems/$id" params={{ id: r.p.id }} className="block rounded-2xl glass p-4">
            <p className="text-xs text-electric">{r.p.title}</p><p className="mt-1 text-sm">{r.body}</p>
          </Link>
        )) : <p className="py-8 text-center text-sm text-muted-foreground">{t("p_no_replies")}</p>)}
        {tab === "about" && <p className="rounded-2xl glass p-4 text-sm text-muted-foreground">{t("local_note")}</p>}
      </div>
    </div>
  );
}
