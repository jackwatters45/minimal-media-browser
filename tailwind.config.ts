import type { Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          black: "#000000",
          white: "#ffffff",
          gray: {
            100: "#f5f5f5",
            200: "#a0a0a0",
            300: "#404040",
          },
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      transitionTimingFunction: {
        "mechanical": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
    },
  },
} as Config;
