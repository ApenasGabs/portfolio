/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec5b13",
        "background-light": "#f3f4f6",
        "background-dark": "#111827",
        "card-light": "#ffffff",
        "card-dark": "#1f2937",
        "text-light": "#1f2937",
        "text-dark": "#f9fafb",
        "border-light": "#e5e7eb",
        "border-dark": "#374151",
        "waka-pink": "#eb4d8a",
      },
      fontFamily: {
        sans: ["Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
