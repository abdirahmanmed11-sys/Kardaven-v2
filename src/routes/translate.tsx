import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { Avatar } from "@/components/kardaven";

export const Route = createFileRoute("/translate")({
  head: () => ({
    meta: [
      { title: "Language & Translation — KARDAVEN" },
      { name: "description", content: "Choose your KARDAVEN language and translation preferences." },
      { property: "og:title", content: "Language & Translation — KARDAVEN" },
      { property: "og:description", content: "Read and post in the language of your choice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Translate,
});

const LANGS: { code: string; flag: string; name: string; live: boolean }[] = [
  { code: "fr", flag: "🇫🇷", name: "Français", live: true },
  { code: "en", flag: "🇬🇧", name: "English", live: true },
  { code: "ar", flag: "🇸🇦", name: "العربية", live: false },
  { code: "es", flag: "🇪🇸", name: "Español", live: false },
  { code: "zh", flag: "🇨🇳", name: "中文", live: false },
  { code: "hi", flag: "🇮🇳", name: "हिन्दी", live: false },
  { code: "pt", flag: "🇧🇷", name: "Português", live: false },
];

const ORIGINAL = "The future of education is not just about learning, but about creating opportunities for everyone, everywhere.";
const TRANSLATED = "L'avenir de l'éducation ne se limite pas à l'apprentissage, mais à la création d'opportunités pour tous, partout.";

function Translate() {
  const { t, lang, setLang } = useI18n();
  const [shown, setShown] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => { setAuto(localStorage.getItem("kardaven:autotr") === "1"); }, []);
  const toggle = () => { const n = !auto; setAuto(n); localStorage.setItem("kardaven:autotr", n ? "1" : "0"); };
  const show = shown || auto;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3">
        <Link to="/profile" aria-label="Back" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="font-sans text-lg font-bold">{t("tr_title")}</h1>
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <div className="flex items-center gap-2.5"><Avatar name="Alex Tech" /><div><p className="text-sm font-semibold">AlexTech</p><p className="text-[11px] text-muted-foreground">Technology · {t("demo")}</p></div></div>
        <p className="mt-3 text-sm">{ORIGINAL}</p>
        <button onClick={() => setShown(!shown)} className="tap mt-3 rounded-full border border-electric/50 px-3 py-1.5 text-xs text-electric">{show ? t("tr_hide") : t("tr_see")}</button>
        {show && (
          <div className="mt-3 rounded-xl border border-border bg-muted/50 p-3 text-sm animate-rise">
            <span className="mr-1">🇫🇷</span>{TRANSLATED}
          </div>
        )}
        <p className="mt-3 text-[11px] text-gold">{t("tr_sim")}</p>
      </div>

      <div className="mt-4 divide-y divide-border rounded-2xl glass text-sm">
        <div className="flex items-center justify-between p-4 text-electric">{t("tr_orig")}<ChevronRight className="h-4 w-4" /></div>
        <label className="flex cursor-pointer items-center justify-between p-4">
          <span className="text-electric">{t("tr_auto")}</span>
          <button role="switch" aria-checked={auto} onClick={toggle}
            className={`relative h-6 w-11 rounded-full transition ${auto ? "bg-electric" : "bg-muted"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all ${auto ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      <p className="eyebrow mt-6 text-muted-foreground">{t("tr_lang")}</p>
      <div className="mt-2 divide-y divide-border rounded-2xl glass">
        {LANGS.map((l) => (
          <button key={l.code} disabled={!l.live} onClick={() => l.live && setLang(l.code as Lang)}
            className="flex w-full items-center gap-3 p-3.5 text-left text-sm disabled:opacity-50">
            <span className="text-xl">{l.flag}</span><span className="flex-1">{l.name}</span>
            {!l.live && <span className="text-[10px] text-muted-foreground">{t("tr_soon")}</span>}
            {l.live && lang === l.code && <Check className="h-4 w-4 text-gold" />}
          </button>
        ))}
      </div>
    </div>
  );
}
