import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — KARDAVEN" },
      { name: "description", content: "KARDAVEN Help page." },
      { property: "og:title", content: "Help — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN Help page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="help" />,
});
