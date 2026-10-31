import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/menu";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — KARDAVEN" },
      { name: "description", content: "KARDAVEN Contact page." },
      { property: "og:title", content: "Contact — KARDAVEN" },
      { property: "og:description", content: "KARDAVEN Contact page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <InfoPage page="contact" />,
});
