/**
 * Design tokens as CSS variable references.
 * Actual values live in styles/tokens.css for both dark and light themes.
 * Components use these keys as they always have — no changes needed in JSX.
 */
export const C = {
  bg:            "var(--bg)",
  surface:       "var(--surface)",
  card:          "var(--surface-raised)",
  cardHover:     "var(--surface-hover)",
  border:        "var(--border)",
  borderActive:  "var(--border-strong)",
  accent:        "var(--accent)",
  accentDim:     "var(--accent-dim)",
  accentGlow:    "var(--accent-subtle)",
  green:         "var(--green)",
  yellow:        "var(--yellow)",
  red:           "var(--red)",
  blue:          "var(--blue)",
  purple:        "var(--purple)",
  textPrimary:   "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted:     "var(--text-muted)",
};

export const SEV_COLOR = {
  Critical: "var(--sev-critical)",
  High:     "var(--sev-high)",
  Medium:   "var(--sev-medium)",
  Low:      "var(--sev-low)",
  Info:     "var(--sev-info)",
};
