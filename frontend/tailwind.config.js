/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,css}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF7",
          /** Marketing / landing canvas (hero, public header) */
          hero: "#FFF8EC",
          100: "#FBF3E4",
          200: "#F3E3C8",
        },
        sand: {
          100: "#EED8B5",
          200: "#DDBB88",
          300: "#C99A5C",
        },
        terracotta: {
          400: "#C46A32",
          500: "#A94F25",
          600: "#7F351B",
        },
        forest: {
          50: "#F2F7F0",
          200: "#BED8C7",
          300: "#8AB89B",
          500: "#1F5A3D",
          600: "#17452F",
          700: "#0F3323",
          /** Primary action green on marketing surfaces */
          accent: "#0F6B3A",
          "accent-hover": "#0c5630",
        },
        gold: {
          400: "#D8A441",
          500: "#B98224",
          star: "#F4B431",
        },
        cocoa: {
          ink: "#1F1A14",
          body: "#3F3328",
          700: "#4A2A18",
          800: "#2F1A10",
        },
        /** Landing middle feature band (pale mint canvas) */
        mint: {
          band: "#F2F5ED",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        card: "1.5rem",
        /** Full pill — navbar auth, forms */
        button: "999px",
        /** Marketing / hero CTAs (reference: 14px) */
        cta: "14px",
        soft: "1rem",
      },
      boxShadow: {
        soft: "0 12px 35px rgba(74, 42, 24, 0.12)",
        card: "0 18px 45px rgba(47, 26, 16, 0.14)",
        button: "0 10px 25px rgba(31, 90, 61, 0.25)",
      },
      backgroundImage: {
        "sounglah-warm":
          "linear-gradient(135deg, #FFFDF7 0%, #FBF3E4 45%, #EED8B5 100%)",
        "sounglah-hero":
          "radial-gradient(circle at top right, rgba(216,164,65,0.25), transparent 35%), linear-gradient(135deg, #FFFDF7, #FBF3E4)",
        "sounglah-dashes":
          "repeating-linear-gradient(90deg, #C99A5C 0px, #C99A5C 6px, transparent 6px, transparent 12px)",
        "forest-gradient":
          "linear-gradient(135deg, #1F5A3D, #0F3323)",
        /** Hero photo blends — rgba matches cream.hero (#FFF8EC) */
        "hero-image-fade":
          "linear-gradient(to right, rgba(255,248,236,0.96) 0%, rgba(255,248,236,0.7) 16%, rgba(255,248,236,0.36) 30%, rgba(255,248,236,0.1) 44%, rgba(255,248,236,0) 58%)",
        "hero-image-fade-mobile":
          "linear-gradient(to bottom, #FFF8EC 0%, rgba(255,248,236,0.34) 38%, rgba(255,248,236,0) 92%)",
      },
      maxWidth: {
        measure: "42rem",
        /** 25% wider than prior page width (~2100px at 16px/rem) */
        page: "131.25rem",
      },
    },
  },
  plugins: [],
}
