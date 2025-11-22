/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["bg-[#f43f5e]", "bg-[#9333ea]", "hamburger"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9f7f6",
          100: "#cfeeed",
          200: "#a4dfde",
          300: "#73c9c8",
          400: "#46b4b2",
          500: "#1ea19f",
          600: "#198a88",
          700: "#147270",
          800: "#0f5958",
          900: "#0a4241",
        },
        brandAlt: {
          500: "#2fb6ad",
          700: "#0f7e78",
        },
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: 0, transform: "translateY(100%)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
