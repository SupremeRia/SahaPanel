import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/toast";
import { ServiceWorkerRegister } from "@/components/pwa-register";
import { themeInitScript } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: {
    default: "Aytemiz Petrol Yakutiye Şubesi",
    template: "%s · Aytemiz Petrol Yakutiye Şubesi"
  },
  description: "Vardiyalı ekipler için duyuru, görev, arıza ve vardiya takip paneli.",
  applicationName: "Aytemiz Petrol Yakutiye Şubesi",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Aytemiz Petrol", statusBarStyle: "default" },
  formatDetection: { telephone: false }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F7F9" },
    { media: "(prefers-color-scheme: dark)", color: "#090E16" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
