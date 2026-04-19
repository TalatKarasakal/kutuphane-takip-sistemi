import type { AppSettings } from '../types/book';

export const FONT_OPTIONS = [
  { value: 'Inter', stack: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { value: 'Merriweather', stack: "'Merriweather', Georgia, 'Times New Roman', serif" },
  { value: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { value: 'JetBrains Mono', stack: "'JetBrains Mono', Menlo, Consolas, monospace" },
  { value: 'System', stack: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' },
];

export function applyTheme(settings: AppSettings) {
  const html = document.documentElement;
  const mode = settings.theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;
  html.dataset.theme = mode;
  html.dataset.accent = settings.accent;
  html.dataset.density = settings.density;
  const font = FONT_OPTIONS.find((f) => f.value === settings.fontFamily) ?? FONT_OPTIONS[0];
  html.style.setProperty('--font-app', font.stack);
  html.style.setProperty('--font-size-app', `${settings.fontSize}px`);
}
