/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        zinc: {
          925: "#131316",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        fadeInScale: "fadeInScale 0.3s ease-out both",
        slideUp: "slideUp 0.4s ease-out both",
      },
    },
  },
  plugins: [],
}
