import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { COMMUNITY_CATEGORIES, createCommunity, getCommunity, resizeImage, updateCommunity, useCommunityStore, type CommunityCategory } from "@/lib/community";
import { CommunityAvatar } from "@/components/kardaven";

type Search = { parent?: string | undefined; edit?: string | undefined };

export const Route = createFileRoute("/community/new")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    parent: typeof s["parent"] === "string" ? s["parent"] : undefined,
    edit: typeof s["edit"] === "string" ? s["edit"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create a community — KARDAVEN" },
      { name: "description", content: "Start your own KARDAVEN community or sub-community with a photo and description." },
      { property: "og:title", content: "Create a community — KARDAVEN" },
      { property: "og:description", content: "Gather people around a problem you care about." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewCommunity,
});

function NewCommunity() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { parent, edit } = Route.useSearch();
  const st = useCommunityStore();
  const parentC = parent ? getCommunity(st, parent) : undefined;
  const editing = edit ? st.created.find((c) => c.slug === edit) : undefined;
  const [f, setF] = useState({ name: "", tagline: "", rules: "", category: (parentC?.category ?? "Community") as CommunityCategory, avatar: "", banner: "" });
  const loaded = useRef(false);
  useEffect(() => {
    if (editing && !loaded.current) {
      loaded.current = true;
      setF({ name: editing.name, tagline: editing.tagline, rules: editing.rules ?? "", category: editing.category, avatar: editing.avatar ?? "", banner: editing.banner ?? "" });
    }
  }, [editing]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>, key: "avatar" | "banner") => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setF((x) => ({ ...x, [key]: "" })); const url = await resizeImage(file, key === "avatar" ? 320 : 900); setF((x) => ({ ...x, [key]: url })); }
    catch { toast.error("Image could not be read"); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    const data = { name: f.name.trim(), tagline: f.tagline.trim(), rules: f.rules.trim(), category: f.category, avatar: f.avatar || undefined, banner: f.banner || undefined };
    try {
      if (editing) { updateCommunity(editing.slug, data); nav({ to: "/community/$slug", params: { slug: editing.slug } }); }
      else { const slug = createCommunity({ ...data, parent }); nav({ to: "/community/$slug", params: { slug } }); }
    } catch { toast.error("Storage full — try a smaller image"); }
  };

  const field = "w-full rounded-xl border border-input bg-muted/40 px-3.5 py-3 text-base outline-none focus:border-electric";
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link to="/community" className="text-sm text-muted-foreground">← {t("back_com")}</Link>
      <h1 className="mt-3 font-sans text-xl font-bold">{editing ? t("cc_edit") : parent ? t("cc_sub_new") : t("cc_new")}</h1>
      {parentC && <p className="mt-1 text-xs text-muted-foreground">{t("cc_in")} <span className="text-electric">{parentC.name}</span></p>}

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="relative block h-32 cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
          {f.banner ? <img src={f.banner} alt="" className="h-full w-full object-cover" /> :
            <span className="grid h-full place-items-center text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><ImagePlus className="h-4 w-4" />{t("cc_banner")}</span></span>}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e, "banner")} />
        </label>
        <div className="flex items-center gap-4">
          <CommunityAvatar c={{ avatar: f.avatar, category: f.category, name: f.name }} className="h-20 w-20" />
          <label className="tap cursor-pointer rounded-xl border border-electric/50 px-4 py-2 text-sm text-electric">
            {t("cc_photo")} · {t("cc_pick")}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e, "avatar")} />
          </label>
        </div>
        <label className="block text-sm">{t("cc_name")}<input required maxLength={50} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${field} mt-1.5`} /></label>
        <label className="block text-sm">{t("cc_desc")}<textarea rows={3} maxLength={300} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} className={`${field} mt-1.5`} /></label>
        <label className="block text-sm">{t("cc_rules")}<textarea rows={2} maxLength={500} value={f.rules} onChange={(e) => setF({ ...f, rules: e.target.value })} className={`${field} mt-1.5`} /></label>
        <div className="text-sm">{t("cc_cat")}
          <div className="mt-1.5 flex flex-wrap gap-2">{COMMUNITY_CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => setF({ ...f, category: c })}
              className={`tap rounded-full border px-3 py-1.5 text-sm ${f.category === c ? "border-electric bg-electric/15" : "border-border text-muted-foreground"}`}>{c}</button>
          ))}</div>
        </div>
        <button className="tap w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">{editing ? t("cc_save") : t("cc_create")}</button>
        <p className="text-xs text-muted-foreground">{t("local_only")}</p>
      </form>
    </div>
  );
}
