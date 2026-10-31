import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { gatewayProvider, KARDAVEN_MODEL, KARDAVEN_SYSTEM, reasoningOptions, userClient } = await import("@/lib/ai/kardaven.server");
        const { getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } = await import("@/lib/ai/run-id.server");
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });
        const sb = userClient(token);
        const { data: u } = await sb.auth.getUser(token);
        if (!u.user) return new Response("Unauthorized", { status: 401 });
        const userId = u.user.id;

        const { threadId, messages } = (await request.json()) as { threadId: string; messages: UIMessage[] };
        const { data: thread } = await sb.from("chat_threads").select("id,title").eq("id", threadId).maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const { error } = await sb.from("chat_messages").upsert(
            { thread_id: threadId, user_id: userId, message_id: last.id, role: "user", parts: last.parts as unknown as Json },
            { onConflict: "thread_id,message_id" },
          );
          if (error) return new Response(error.message, { status: 500 });
          const firstText = last.parts.find((p) => p.type === "text")?.text ?? "";
          const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
          if (messages.filter((m) => m.role === "user").length === 1 && firstText) patch.title = firstText.slice(0, 60);
          await sb.from("chat_threads").update(patch).eq("id", threadId);
        }

        const { provider, runIdFetch } = gatewayProvider(getLovableAiGatewayRunId(request));
        const result = streamText({
          model: provider.responses(KARDAVEN_MODEL),
          instructions: KARDAVEN_SYSTEM,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: reasoningOptions("low"),
        });
        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages,
            sendReasoning: true,
            onFinish: async ({ responseMessage }) => {
              const { error } = await sb.from("chat_messages").upsert(
                { thread_id: threadId, user_id: userId, message_id: responseMessage.id, role: "assistant", parts: responseMessage.parts as unknown as Json },
                { onConflict: "thread_id,message_id" },
              );
              if (error) console.error("Failed to save assistant message", error);
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
