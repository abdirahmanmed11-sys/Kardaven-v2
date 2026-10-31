import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/kardaven";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — KARDAVEN" },
      { name: "description", content: "Sign in to KARDAVEN with Google, Apple, Lovable or email." },
      { property: "og:title", content: "Sign in — KARDAVEN" },
      { property: "og:description", content: "Access your KARDAVEN account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/profile" }); }, [user, nav]);

  const social = async (p: "google" | "apple" | "lovable") => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { toast.error(res.error.message); setBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin + "/auth" } });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success(t("au_check"));
    }
    setBusy(false);
  };

  const btn = "tap flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 py-3 text-sm font-semibold disabled:opacity-60";
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="mt-4 font-display text-2xl font-bold">{t("au_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("au_sub")}</p>
      </div>
      <div className="mt-8 space-y-3">
        <button disabled={busy} onClick={() => social("google")} className={btn}>{t("au_google")}</button>
        <button disabled={busy} onClick={() => social("apple")} className={btn}>{t("au_apple")}</button>
        <button disabled={busy} onClick={() => social("lovable")} className={btn}>{t("au_lovable")}</button>
      </div>
      <p className="my-6 text-center text-xs text-muted-foreground">{t("au_or")}</p>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" required autoComplete="email" placeholder={t("au_email")} value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-electric" />
        <input type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={t("au_pass")} value={pass} onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-electric" />
        <button disabled={busy} className="tap w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{mode === "in" ? t("au_in") : t("au_up")}</button>
      </form>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-electric">
        {mode === "in" ? t("au_switch_up") : t("au_switch_in")}
      </button>
    </div>
  );
}
