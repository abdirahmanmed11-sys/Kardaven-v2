import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — KARDAVEN" },
      { name: "description", content: "KARDAVEN About page." },
      { property: "og:title", content: "About — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN About page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="about" />,
});
