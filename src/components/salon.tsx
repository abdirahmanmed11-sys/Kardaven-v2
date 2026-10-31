import { useEffect, useRef, useState } from "react";
import { Bot, Send, ListCollapse, Mic, Hash, Volume2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { roomAgent } from "@/lib/kardaven.functions";
import { chatOf, inVoice, pushAi, sendChat, summarizeChat, TEXT_CHANNELS, toggleVoice, useExtra, voiceRoomsOf, type TextChannel } from "@/lib/community";

/** Live rooms (Discord-style): text channels + simulated voice rooms. Messages stay on this device for now. */
export function Salon({ slug }: { slug: string }) {
  const { lang, t } = useI18n();
  const fr = lang === "fr";
  const x = useExtra();
  const [ch, setCh] = useState<TextChannel>("general");
  const msgs = chatOf(x, slug, ch);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const agent = useServerFn(roomAgent);
  const [thinking, setThinking] = useState(false);
  const history = () => chatOf(x, slug, ch).filter((m) => !m.hidden).map((m) => ({ author: m.author, body: m.body }));
  const callAgent = async (mode: "ask" | "summary", question: string, hist: { author: string; body: string }[]) => {
    setThinking(true);
    try { const r = await agent({ data: { mode, question, history: hist, lang, room: `${slug}/${ch}` } }); pushAi(slug, r.text, ch); }
    catch (e) { toast.error(fr ? "Kardaven n'a pas pu répondre." : "Kardaven couldn't reply."); console.error(e); }
    finally { setThinking(false); }
  };
  const summarize = () => (user ? callAgent("summary", "", history()) : summarizeChat(slug, lang, ch));
  const submitMsg = () => {
    const body = text.trim(); if (!body) return;
    const hist = [...history(), { author: "You", body }];
    const q = sendChat(slug, body, lang, ch, !!user); setText("");
    if (q !== null) void callAgent("ask", q || body, hist);
  };
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs.length, ch]);
  const chLabel: Record<TextChannel, string> = { general: t("ch_general"), help: t("ch_help"), wins: t("ch_wins") };
  const rooms = voiceRoomsOf(slug);
  const roomLabel: Record<string, string> = { lounge: t("vr_lounge"), cowork: t("vr_cowork") };

  return (
    <div className="mt-5 space-y-4">
      {/* Voice rooms */}
      <div className="rounded-2xl glass p-4">
        <p className="flex items-center gap-2 text-sm font-semibold"><Volume2 className="h-4 w-4 text-gold" />{t("voice_rooms")}</p>
        <div className="mt-3 space-y-2">
          {rooms.map((r) => {
            const joined = inVoice(x, slug, r.id);
            const members = joined ? [...r.members, t("you")] : r.members;
            return (
              <div key={r.id} className={`flex items-center gap-3 rounded-xl border p-3 ${joined ? "border-gold/50 bg-gold/5" : "border-border"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${joined ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}><Mic className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {roomLabel[r.id] ?? r.id}
                    {joined && <span className="flex items-center gap-1 text-[10px] font-normal text-gold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />{t("vr_live")}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{members.join(", ")}</p>
                </div>
                <button onClick={() => toggleVoice(slug, r.id)} aria-pressed={joined}
                  className={`tap shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${joined ? "border border-gold/50 text-gold" : "bg-primary text-primary-foreground"}`}>
                  {joined ? t("vr_leave") : t("vr_join")}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{t("vr_sim")}</p>
      </div>

      {/* Text channels */}
      <div className="rounded-2xl glass">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3">
          {TEXT_CHANNELS.map((c) => (
            <button key={c} onClick={() => setCh(c)}
              className={`tap flex shrink-0 items-center gap-1 rounded-t-lg px-3 py-2 text-sm ${ch === c ? "bg-muted/60 font-semibold text-foreground" : "text-muted-foreground"}`}>
              <Hash className="h-3.5 w-3.5" />{chLabel[c]}
            </button>
          ))}
          <button onClick={summarize} disabled={thinking} className="tap ml-auto mb-1 flex shrink-0 items-center gap-1 rounded-full border border-electric/40 px-3 py-1 text-xs text-electric"><ListCollapse className="h-3.5 w-3.5" />{fr ? "Résumer" : "Summarize"}</button>
        </div>
        <div className="max-h-[50vh] space-y-3 overflow-y-auto p-4">
          {msgs.map((m) => (
            <div key={m.id} className={m.ai ? "rounded-xl border border-electric/30 bg-electric/5 p-3" : ""}>
              <p className="flex items-center gap-1.5 text-xs">
                {m.ai && <Bot className="h-3.5 w-3.5 text-electric" />}
                <span className={`font-semibold ${m.ai ? "text-electric" : ""}`}>{m.author}</span>
                <span className="text-muted-foreground">{m.at}</span>
              </p>
              <p className={`mt-0.5 whitespace-pre-line text-sm ${m.hidden ? "italic text-muted-foreground line-through" : ""}`}>{m.hidden ? (fr ? "Message masqué" : "Hidden message") : m.body}</p>
            </div>
          ))}
          {thinking && <p className="flex items-center gap-1.5 text-xs text-electric animate-pulse"><Bot className="h-3.5 w-3.5" />Kardaven…</p>}
          <div ref={end} />
        </div>
        <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); submitMsg(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={fr ? `Message #${chLabel[ch]}… (« @kardaven » pour l'IA)` : `Message #${chLabel[ch]}… ("@kardaven" for the AI)`}
            className="min-w-0 flex-1 rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-base outline-none focus:border-electric" />
          <button aria-label="Send" className="tap grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
        </form>
        <p className="px-4 pb-3 text-[11px] text-muted-foreground">{user ? (fr ? "Kardaven (IA réelle) · messages visibles seulement sur cet appareil" : "Kardaven (real AI) · messages visible only on this device") : (fr ? "IA simulée — connectez-vous pour Kardaven · messages sur cet appareil" : "Simulated AI — sign in for Kardaven · messages on this device")}</p>
      </div>
    </div>
  );
}
