import type { MetadataRoute } from "next";
import { BRAND_HEX } from "@/lib/brandIcon";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pqp, era pra hoje?",
    short_name: "pqp",
    description: "o caderninho de demandas que não esquece.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: BRAND_HEX.bg,
    theme_color: BRAND_HEX.bg,
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
