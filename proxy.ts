import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Auth kontrolunu; statik dosyalar, PWA dosyalari (manifest, service worker,
    // cevrimdisi sayfasi) ve ikonlar disindaki tum yollara uygula.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|html|txt|xml|woff2?)$).*)"
  ]
};
