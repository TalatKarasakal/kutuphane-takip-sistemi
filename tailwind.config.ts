import type { Config } from "tailwindcss";

/*
 * Renkler `docs/design/arayuz-token-seti.md` içindeki token setinden gelir ve
 * yalnız CSS değişkeni olarak taşınır. Değerler hex/rgba olduğu için Tailwind'in
 * `<alpha-value>` yerleştirmesi kullanılmaz; saydam varyantlar gerektiğinde
 * token'ın kendisi (`--accent-soft`, `--line`) tanımlıdır.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Yüzey kademeleri
        app: "var(--bg-app)",
        sidebar: "var(--bg-sidebar)",
        topbar: "var(--bg-topbar)",
        panel: "var(--bg-panel)",
        row: "var(--bg-row)",
        "row-alt": "var(--bg-row-alt)",
        hover: "var(--bg-hover)",
        active: "var(--bg-active)",

        // Metin
        text: "var(--text)",
        dim: "var(--text-dim)",
        mute: "var(--text-mute)",

        // Çizgiler
        line: "var(--line)",
        "line-strong": "var(--line-strong)",

        // Vurgular
        accent: {
          DEFAULT: "var(--accent)",
          hot: "var(--accent-hot)",
          soft: "var(--accent-soft)",
          line: "var(--accent-line)",
        },
        navy: "var(--navy)",
        glow: "var(--glow)",
        success: "var(--success)",
        /** Bordo. Karanlık temada vurguyla aynı, aydınlıkta yalnız durum rengi. */
        warn: "var(--warn)",
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
      fontFamily: {
        app: "var(--font-app)",
      },
      fontSize: {
        app: "var(--font-size-app)",
      },
      boxShadow: {
        // Aydınlık temada dolu, karanlık temada `none`; derinlik orada yüzey
        // farkıyla kurulur.
        elev1: "var(--elev-1)",
        elev2: "var(--elev-2)",
      },
      transitionDuration: {
        DEFAULT: "140ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
