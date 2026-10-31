import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { SendHorizonal, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TKey } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { loadThread } from "@/lib/kardaven.functions";
import { KardavenHeader } from "@/components/kardaven";

export const Route = createFileRoute("/assistant_/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation avec Kardaven — KARDAVEN" },
      { name: "description", content: "Votre conversation avec Kardaven, l'agent IA de KARDAVEN." },
      { property: "og:title", content: "Conversation avec Kardaven — KARDAVEN" },
      { property: "og:description", content: "Questions, conseils et plans d'action avec Kardaven." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user, loading } = useAuth();
  const { lang } = useI18n();
  const load = useServerFn(loadThread);
  const q = useQuery({ queryKey: ["thread", threadId], queryFn: () => load({ data: { id: threadId } }), enabled: !!user, staleTime: Infinity });
  const fr = lang === "fr";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-2xl flex-col px-4 py-5">
      <div className="flex items-center justify-between"><KardavenHeader /><Link to="/assistant" className="text-sm text-muted-foreground">← {fr ? "Conversations" : "Conversations"}</Link></div>
      {!loading && !user && <p className="mt-8 text-center text-sm"><Link to="/auth" className="text-electric">{fr ? "Connectez-vous" : "Sign in"}</Link></p>}
      {q.data === null && <p className="mt-8 text-center text-sm text-muted-foreground">{fr ? "Conversation introuvable." : "Conversation not found."}</p>}
      {q.data && <ChatWindow key={threadId} threadId={threadId} initial={q.data as UIMessage[]} />}
    </div>
  );
}

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      },
    }),
    onError: (e) => {
      const m = e.message;
      toast.error(/402|credit/i.test(m) ? (lang === "fr" ? "Crédits IA épuisés." : "AI credits exhausted.") : /429/.test(m) ? (lang === "fr" ? "Trop de demandes, réessayez dans un instant." : "Too many requests, try again shortly.") : m || "Error");
    },
    onFinish: () => { qc.invalidateQueries({ queryKey: ["threads"] }); qc.setQueryData(["thread", threadId], undefined); box.current?.focus(); },
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => { box.current?.focus(); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, status]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() }); setInput(""); box.current?.focus();
  };
  const chips: TKey[] = ["chip_advice", "chip_explain", "chip_res", "chip_solve"];

  return (
    <>
      <div className="mt-4 flex-1 space-y-3">
        <div className="max-w-[85%] text-sm">{t("ai_hello")}</div>
        {!messages.length && (
          <div className="flex flex-col items-start gap-2 pt-2">
            {chips.map((c) => <button key={c} onClick={() => send(t(c))} className="tap rounded-full border border-electric/50 px-4 py-2 text-xs text-electric hover:bg-electric/10">{t(c)}</button>)}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary p-3.5 text-sm text-primary-foreground animate-rise" : "max-w-full text-sm"}>
            {m.parts.map((p, i) => {
              if (p.type === "text") return m.role === "user" ? <p key={i} className="whitespace-pre-wrap">{p.text}</p> : (
                <div key={i} className="kd-md space-y-2 leading-relaxed"><ReactMarkdown>{p.text}</ReactMarkdown></div>
              );
              if (p.type === "reasoning" && p.text) return <details key={i} className="mb-2 text-xs text-muted-foreground"><summary className="cursor-pointer">{lang === "fr" ? "Réflexion" : "Thinking"}</summary><p className="mt-1 whitespace-pre-wrap">{p.text}</p></details>;
              return null;
            })}
          </div>
        ))}
        {status === "submitted" && <div className="w-16 rounded-2xl glass p-3 text-center text-electric animate-pulse-glow">•••</div>}
        <div ref={end} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-20 mt-4 flex items-end gap-2 rounded-2xl border border-input bg-card px-4 py-2 md:bottom-4">
        <textarea ref={box} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder={t("ai_input")} className="max-h-40 flex-1 resize-none bg-transparent py-2 text-base outline-none" />
        {busy
          ? <button type="button" onClick={() => stop()} aria-label="Stop" className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-foreground"><Square className="h-4 w-4" /></button>
          : <button aria-label={t("send")} className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-electric text-primary-foreground"><SendHorizonal className="h-4 w-4" /></button>}
      </form>
    </>
  );
}
