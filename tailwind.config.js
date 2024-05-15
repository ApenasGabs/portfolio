/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#ffff",

          secondary: "#00a7b9",

          accent: "#ff9a00",

          neutral: "#262d2c",

          "base-100": "#27292e",

          info: "#00d3ff",

          success: "#00b94e",

          warning: "#ff9e00",

          error: "#ff95af",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
