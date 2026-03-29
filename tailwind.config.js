/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Arial", "sans-serif"],
      },
      screens: {
      xs: "400px", 
    },
      animation: {
        ticker: "ticker 18s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },   // ✅ closes extend
  },     // ✅ closes theme
  plugins: [
    require("@tailwindcss/typography"),
  ],
}