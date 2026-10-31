import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { VoteBox } from "@/components/spaces";
import { useI18n } from "@/lib/i18n";
import { addCommunityReply, DEMO_COMMUNITIES, getCommunity, useCommunityStore , useExtra } from "@/lib/community";
import { SourceBadge } from "@/components/kardaven";

export const Route = createFileRoute("/community/$slug_/$postId")({
  loader: ({ params }) => {
    const c = DEMO_COMMUNITIES.find((x) => x.slug === params.slug);
    if (!c) return null;
    const p = c.posts.find((x) => x.id === params.postId);
    return { community: c.name, title: p?.title ?? "Discussion" };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — KARDAVEN` : "Discussion — KARDAVEN" },
      { name: "description", content: loaderData ? `A discussion in ${loaderData.community} on KARDAVEN.` : "A KARDAVEN discussion." },
      { property: "og:title", content: loaderData ? `${loaderData.title} — KARDAVEN` : "Discussion — KARDAVEN" },
      { property: "og:description", content: loaderData ? `A discussion in ${loaderData.community}.` : "A KARDAVEN discussion." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug, postId } = Route.useParams();
  const { t } = useI18n();
  const st = useCommunityStore();
  const c = getCommunity(st, slug);
  const p = c?.posts.find((x) => x.id === postId);
  const [reply, setReply] = useState("");
  const x = useExtra();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/community/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-foreground">← {t("back_disc")}</Link>
      {!p ? <p className="py-16 text-center text-muted-foreground">{t("no_posts")}</p> : (
        <>
          <article className="mt-4 rounded-2xl glass p-5">
            <div className="flex items-center gap-2"><span className="eyebrow text-electric">{c!.name}</span><SourceBadge isDemo={p.isDemo} /></div>
            <h1 className="mt-2 font-sans text-xl font-semibold md:text-2xl">{p.title}</h1>
            {p.body && <p className="mt-3 text-muted-foreground">{p.body}</p>}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground"><VoteBox row k={`${slug}/${p.id}`} base={p.votes} /><span>{t(p.tag)} · {p.author} · {p.at}</span></div>
          </article>
          <h2 className="mt-8 text-lg font-semibold">{p.replies.length} {t("replies")}</h2>
          <div className="mt-3 space-y-3">
            {[...p.replies].sort((a, b) => (x.votes[`${slug}/${p.id}/${b.id}`] ?? 0) - (x.votes[`${slug}/${p.id}/${a.id}`] ?? 0)).map((r, i) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-sm"><span className="font-semibold">{r.author}</span>{r.author === c!.founder && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold">Expert</span>}{i === 0 && p.tag === "Question" && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">★</span>}<SourceBadge isDemo={r.isDemo} /><span className="ml-auto text-xs text-muted-foreground">{r.at}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                <div className="mt-2"><VoteBox row k={`${slug}/${p.id}/${r.id}`} base={0} /></div>
              </div>
            ))}
          </div>
          <form className="mt-5 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; addCommunityReply(slug, p.id, reply.trim()); setReply(""); }}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder={t("reply_ph")}
              className="w-full rounded-xl border border-input bg-muted/40 px-3.5 py-3 text-base outline-none focus:border-electric" />
            <button className="tap w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">{t("post_reply")}</button>
            <p className="text-xs text-muted-foreground">{t("local_only")}</p>
          </form>
        </>
      )}
    </div>
  );
}
