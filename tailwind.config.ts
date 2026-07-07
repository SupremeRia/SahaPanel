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
        // Sabit marka renkleri
        field: "#F4F7F9",
        brand: {
          50: "#E9F7F1",
          100: "#CFEFE0",
          200: "#A6E0C6",
          400: "#3CB587",
          500: "#1D9A6C",
          600: "#147C58",
          700: "#0E6045"
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
        panel: "0 14px 40px rgba(23, 32, 42, 0.08)",
        card: "0 1px 2px rgba(23, 32, 42, 0.06), 0 1px 3px rgba(23, 32, 42, 0.04)",
        pop: "0 12px 32px rgba(23, 32, 42, 0.16)"
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
        }
      },
      animation: {
        "toast-in": "toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "overlay-in": "overlay-in 0.15s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
