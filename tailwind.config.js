/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#ec4899",
        background: "#0f172a",
        surface: "#1e293b",
        title: "#f8fafc",
        body: "#94a3b8",
        muted: "#64748b",
        border: "#334155",
      }
    },
  },
  plugins: [],
}
