import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — KARDAVEN" },
      { name: "description", content: "KARDAVEN Terms page." },
      { property: "og:title", content: "Terms — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN Terms page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="terms" />,
});
