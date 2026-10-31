import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — KARDAVEN" },
      { name: "description", content: "KARDAVEN Settings page." },
      { property: "og:title", content: "Settings — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN Settings page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="settings" />,
});
