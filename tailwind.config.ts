import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        card: "#1a1a1a",
        border: "#2a2a2a",
        signal: {
          green: "#10b981",
          yellow: "#fbbf24",
          orange: "#f97316",
          red: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;
