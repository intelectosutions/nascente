import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#1a1a1a",
        ink: "#fafafa",
        muted: "#a3a3a3",
        accent: "#22c55e",
        warn: "#eab308",
        danger: "#ef4444",
        info: "#3b82f6",
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
