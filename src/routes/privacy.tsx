import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — KARDAVEN" },
      { name: "description", content: "KARDAVEN Privacy page." },
      { property: "og:title", content: "Privacy — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN Privacy page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="privacy" />,
});
