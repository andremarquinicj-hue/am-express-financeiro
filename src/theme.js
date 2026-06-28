// src/theme.js
// Tokens de marca AM Express — navy + royal, extraídos do logo real.
export const C = {
  bg: "#070C1E",
  surface: "rgba(20,30,68,.55)",
  surface2: "#18244F",
  border: "rgba(91,134,255,.16)",
  borderSoft: "rgba(91,134,255,.09)",
  navy: "#0D1D56",
  royal: "#2B5CE6",
  royalDeep: "#1F4AD0",
  sky: "#5B86FF",
  green: "#2BD98A",
  greenDim: "#1c8d5c",
  red: "#FF5B6E",
  redDim: "#9c3a48",
  amber: "#F2B544",
  text: "#EAF0FF",
  muted: "#9AA8CE",
  dim: "#69769E",
};

export const FONT_DISPLAY = "'Oswald', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";

export const GLOBAL_FONTS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;
