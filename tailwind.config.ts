import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f7f1",
        surface: "#ffffff",
        ink: "#183020",
        muted: "#647268",
        accent: "#16803d",
        warn: "#a16207",
        danger: "#c2413b",
        info: "#2563eb",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        "kpi": ["clamp(4rem, 12vw, 8rem)", { lineHeight: "1", fontWeight: "800", letterSpacing: "-0.04em" }],
        "kpi-sub": ["clamp(2rem, 5vw, 3.5rem)", { lineHeight: "1.1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
