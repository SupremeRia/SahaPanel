import type { Config } from "tailwindcss";

const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tema degiskenlerine bagli anlamsal renkler (light/dark otomatik)
        canvas: withVar("--canvas"),
        surface: withVar("--surface"),
        "surface-2": withVar("--surface-2"),
        line: withVar("--line"),
        ink: withVar("--ink"),
        muted: withVar("--muted"),
        "muted-2": withVar("--muted-2"),
        // Sabit marka renkleri — mat kirmizi vurgu
        field: "#F4F5F7",
        brand: {
          50: "#F7EAEA",
          100: "#EFD2D1",
          200: "#E0A9A7",
          400: "#C0514D",
          500: "#B23B37",
          600: "#9A2F2C",
          700: "#7E2523"
        },
        // Ince detay / ikon vurgulari icin altin
        gold: {
          300: "#E6CE86",
          400: "#D4AF37",
          500: "#BE9A2C"
        },
        amber: {
          400: "#E6A23C",
          500: "#D88A1D"
        },
        signal: {
          red: "#C44536",
          blue: "#2F73B7",
          purple: "#7C5CD6"
        }
      },
      boxShadow: {
        panel: "0 14px 34px rgba(15, 23, 42, 0.12)",
        card: "0 1px 2px rgba(15, 23, 42, 0.08)",
        pop: "0 18px 42px rgba(15, 23, 42, 0.22)",
        glow: "0 0 0 1px rgba(178, 59, 55, 0.28), 0 16px 38px rgba(15, 23, 42, 0.18)"
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        // Login formu yumusak acilis
        reveal: {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        // Ilk ekrandaki butonlarin yumusak girisi
        "reveal-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "toast-in": "toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "overlay-in": "overlay-in 0.15s ease-out",
        reveal: "reveal 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
        "reveal-down": "reveal-down 0.42s cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
};

export default config;
