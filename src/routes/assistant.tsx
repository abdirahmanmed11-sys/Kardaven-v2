import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { KardavenHeader } from "@/components/kardaven";
import { createThread, deleteThread, listThreads } from "@/lib/kardaven.functions";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Kardaven, assistant IA — KARDAVEN" },
      { name: "description", content: "Discutez avec Kardaven, l'agent IA de KARDAVEN, et retrouvez toutes vos conversations." },
      { property: "og:title", content: "Kardaven, assistant IA — KARDAVEN" },
      { property: "og:description", content: "Un agent IA concis qui transforme vos questions en actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Threads,
});

function Threads() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const threads = useQuery({ queryKey: ["threads"], queryFn: () => list(), enabled: !!user });
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try { const id = await create(); await qc.invalidateQueries({ queryKey: ["threads"] }); nav({ to: "/assistant/$threadId", params: { threadId: id } }); }
    catch (e) { toast.error((e as Error).message); setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <KardavenHeader />
      {!loading && !user ? (
        <div className="mt-8 rounded-2xl glass ai-border p-5 text-center">
          <p className="text-sm">{fr ? "Connectez-vous pour discuter avec Kardaven et retrouver vos conversations sur tous vos appareils." : "Sign in to chat with Kardaven and keep your conversations on every device."}</p>
          <Link to="/auth" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{fr ? "Se connecter" : "Sign in"}</Link>
        </div>
      ) : (
        <>
          <button disabled={busy || !user} onClick={start} className="tap mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground glow-electric disabled:opacity-60">
            <MessageSquarePlus className="h-4 w-4" />{fr ? "Nouvelle conversation" : "New conversation"}
          </button>
          <ul className="mt-5 space-y-2">
            {threads.data?.map((th) => (
              <li key={th.id} className="flex items-center gap-2 rounded-xl border border-border">
                <Link to="/assistant/$threadId" params={{ threadId: th.id }} className="min-w-0 flex-1 px-4 py-3">
                  <p className="truncate text-sm font-medium">{th.title}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(th.updated_at).toLocaleString(lang)}</p>
                </Link>
                <button aria-label={fr ? "Supprimer" : "Delete"} onClick={async () => { await del({ data: { id: th.id } }); qc.invalidateQueries({ queryKey: ["threads"] }); }}
                  className="tap mr-2 grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {threads.data?.length === 0 && <p className="text-center text-sm text-muted-foreground">{fr ? "Aucune conversation pour l'instant." : "No conversations yet."}</p>}
          </ul>
        </>
      )}
    </div>
  );
}
