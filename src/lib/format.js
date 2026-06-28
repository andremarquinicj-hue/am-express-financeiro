// src/lib/format.js
export const brl = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fnum = (v, d = 1) =>
  (v || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

export const pnum = (v) => {
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
};

export const today = () => new Date().toISOString().slice(0, 10);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const fmtDateShort = (iso) => {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export const fmtDateFull = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const diasEntre = (isoA, isoB) => {
  const a = new Date(isoA + "T00:00:00");
  const b = new Date(isoB + "T00:00:00");
  return Math.round((b - a) / 86400000);
};

export const estaAtrasado = (dataPrevistaOuVencimento, hojeIso = today()) =>
  dataPrevistaOuVencimento < hojeIso;
