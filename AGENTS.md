<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- User content lives in `src/lib/data.ts` localStorage store behind small functions (addProblem, addReply, cycleStep); swap for Lovable Cloud later without touching pages.
- AI runs server-side through Lovable AI Gateway (`src/lib/ai/kardaven.server.ts`, one shared system prompt); signed-in users get real AI, signed-out users fall back to `simulateAI`/simulated room replies which must stay labelled as simulated.
- Kardaven chat threads and messages are stored per user in the database (chat_threads, chat_messages; RLS by owner); streaming goes through `/api/chat`, thread pages live at `/assistant/$threadId`.
- UI strings go through `src/lib/i18n.tsx` (en/fr); demo content is English and flagged `isDemo`.
- Community content (memberships, posts, replies) lives in `src/lib/community.ts` as a separate localStorage store with demo communities flagged `isDemo`; swap for Lovable Cloud later without touching pages.
- The app logo is the user's own image at `src/assets/logo-k.png` (blue crystalline K in a gold ring, transparent PNG) rendered by `Logo` in `src/components/kardaven.tsx`; do not replace it with a drawn SVG or regenerated art. The favicon is a 64x64 copy in `public/favicon.png`.
