/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#38bdf8",
        "accent-warm": "#f97316",
        "background-light": "#f1f5f9",
        "background-dark": "#070a0f",
        "card-light": "rgba(255, 255, 255, 0.78)",
        "card-dark": "rgba(13, 18, 27, 0.64)",
        "text-light": "#0f172a",
        "text-dark": "#f1f5f9",
        "border-light": "rgba(15, 23, 42, 0.1)",
        "border-dark": "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
