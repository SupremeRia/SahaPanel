import type { MetadataRoute } from "next";

// Next.js bu dosyayi otomatik olarak /manifest.webmanifest adresinde sunar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SahaPanel — Saha Takip Paneli",
    short_name: "SahaPanel",
    description:
      "Vardiyalı ekipler için duyuru, görev, arıza ve vardiya takibini tek yerden yöneten saha operasyon paneli.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F7F9",
    theme_color: "#147C58",
    lang: "tr",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
