import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahaPanel",
  description: "Vardiyali ekipler icin saha takip paneli"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
