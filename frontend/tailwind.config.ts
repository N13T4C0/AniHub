import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal AniHub
        primary: {
          DEFAULT: "#6C63FF",  // Violeta anime
          50: "#f0effe",
          100: "#e4e1fd",
          200: "#ccc7fb",
          300: "#a89ef8",
          400: "#8876f3",
          500: "#6C63FF",
          600: "#5a4de8",
          700: "#4c3dd0",
          800: "#3f33aa",
          900: "#352e87",
        },
        accent: {
          DEFAULT: "#FF6B6B",  // Rojo coral para badges/alertas
          500: "#FF6B6B",
        },
        dark: {
          DEFAULT: "#08080e",  // Fondo oscuro principal — casi negro
          100: "#0e0e18",
          200: "#131320",
          300: "#1a1a2e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Nunito", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
