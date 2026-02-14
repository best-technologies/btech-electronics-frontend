/**
 * Theme design tokens (also defined in globals.css).
 * Use Tailwind semantic colors (primary, accent, etc.) in components.
 * For raw brand colors in rare cases, use CSS: var(--brand-navy), etc.
 */
export const theme = {
  brand: {
    navy: "#001427",
    redDark: "#8d0801",
    red: "#bf0603",
    orange: "#f18701",
  },
} as const;
