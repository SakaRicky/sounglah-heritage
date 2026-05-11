/** @type {import('tailwindcss').Config} */
/* Sounglah colors use dashed flat keys (e.g. cream-50) so @apply in CSS resolves reliably. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sounglah: {
          "cream-50": "#FFFDF8",
          "cream-100": "#FFF7E8",
          "cream-200": "#F8E8C8",
          "green-50": "#EEF8F1",
          "green-100": "#D7EBDD",
          "green-300": "#7DBB8C",
          "green-500": "#18733A",
          "green-600": "#0F5F2F",
          "green-700": "#084A25",
          "green-900": "#062F19",
          "earth-100": "#F2DFCA",
          "earth-300": "#D8A66F",
          "earth-500": "#A65F2B",
          "earth-700": "#6B3518",
          "gold-300": "#FFD36A",
          "gold-400": "#F4B83F",
          "gold-500": "#E09A1B",
          "clay-400": "#C96A3A",
          "clay-500": "#A94E2A",
          "ink-500": "#6B5E52",
          "ink-700": "#3E332B",
          "ink-900": "#1E1915",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sounglah: "1.25rem",
        card: "1.5rem",
        button: "0.9rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(30, 25, 21, 0.08)",
        card: "0 8px 24px rgba(30, 25, 21, 0.10)",
        floating: "0 18px 50px rgba(30, 25, 21, 0.16)",
      },
      backgroundImage: {
        "hero-warm":
          "linear-gradient(90deg, #FFFDF8 0%, rgba(255,253,248,0.92) 35%, rgba(255,247,232,0.3) 100%)",
      },
      maxWidth: {
        measure: "42rem",
      },
    },
  },
  plugins: [],
}
