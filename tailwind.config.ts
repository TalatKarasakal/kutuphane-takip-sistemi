import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Kişisel tasarım paleti (kariyer-vault, 08-Tercihler/tasarim-tercihleri.md).
        // Zemin için Petrol/Nötr, vurgu için Turkuaz/Bordo/Elektrik Mavi, sıcak
        // detay için Kemik. Bordo 500'ün üstü kullanılmaz (parlak kırmızı yok).
        petrol: {
          50: "#E6EEF4",
          100: "#C4D7E3",
          200: "#9AB8CB",
          300: "#6E97B0",
          400: "#4A7A98",
          500: "#305F7C",
          600: "#244A63",
          700: "#1A384D",
          800: "#12293A",
          900: "#0C1E2B",
          950: "#06121A",
        },
        elektrik: {
          100: "#D8EBFA",
          200: "#AFD7F4",
          300: "#7FBEEC",
          400: "#4FA3E3",
          500: "#2A8AD8",
          600: "#1873C4",
          700: "#135FA3",
          800: "#0E4C82",
          900: "#0A3A63",
        },
        turkuaz: {
          100: "#D2F4F0",
          200: "#A6E9E2",
          300: "#74DACF",
          400: "#45C9BB",
          500: "#1FB6A6",
          600: "#16A398",
          700: "#12887E",
          800: "#0E6E66",
          900: "#0A5751",
        },
        bordo: {
          100: "#F5D5D1",
          200: "#E9A9A2",
          300: "#D9786E",
          400: "#C95449",
          500: "#B8382D",
          600: "#A32B22",
          700: "#8C2A22",
          800: "#73201A",
          900: "#591713",
          950: "#3D0F0C",
        },
        notr: {
          50: "#F4F7F9",
          100: "#E4EAEE",
          200: "#C9D3DA",
          300: "#A9B6C0",
          400: "#8695A2",
          500: "#667785",
          600: "#4A5A67",
          700: "#33404B",
          800: "#222C35",
          900: "#161D23",
          950: "#0D1216",
        },
        kemik: {
          300: "#EBE1C9",
          400: "#DBCDAA",
          500: "#C9B88F",
          600: "#A8945F",
          700: "#8A7A55",
          // Palet 700'de bitiyor; açık temada rozet yazısı olarak 700 kontrast
          // eşiğini geçmediği için aynı aileden bir kademe koyu eklendi.
          800: "#6B5E42",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        /** Elektrik Mavi: bağlantı, seçili durum ve odak halkası. */
        accent: "rgb(var(--accent) / <alpha-value>)",
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
      },
      fontFamily: {
        app: "var(--font-app)",
      },
      fontSize: {
        app: "var(--font-size-app)",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
