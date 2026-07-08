"use client";

import { useEffect } from "react";
import { pingPresence } from "@/app/actions";

const HEARTBEAT_MS = 60_000;

// Panel gorunur oldugu surece kullanicinin cevrimici durumunu tazeler.
export function PresenceHeartbeat() {
  useEffect(() => {
    pingPresence();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") pingPresence();
    }, HEARTBEAT_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") pingPresence();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
