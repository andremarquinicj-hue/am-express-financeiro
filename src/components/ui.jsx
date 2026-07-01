// src/components/ui.jsx
import React from "react";
import { C, FONT_BODY, FONT_MONO } from "../theme";

export const Field = ({ label, children, hint }) => (
  <label style={{ display: "block", marginBottom: 14, minWidth: 0 }}>
    <span style={{ display: "block", fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase",
      color: C.muted, marginBottom: 7, fontWeight: 600 }}>{label}</span>
    {children}
    {hint && <span style={{ fontSize: 11, color: C.dim, marginTop: 5, display: "block" }}>{hint}</span>}
  </label>
);

const inputBase = {
  width: "100%", minWidth: 0, boxSizing: "border-box", background: "rgba(7,12,30,.6)",
  border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "13px 14px",
  fontSize: 15, fontFamily: FONT_MONO, outline: "none",
};

export const Input = (p) => (
  <input {...p}
    onFocus={(e) => (e.target.style.borderColor = C.royal)}
    onBlur={(e) => (e.target.style.borderColor = "rgba(91,134,255,.16)")}
    style={{ ...inputBase, ...(p.style || {}) }} />
);

export const Select = (p) => (
  <select {...p} style={{ ...inputBase, fontFamily: FONT_BODY, appearance: "none", cursor: "pointer",
    ...(p.style || {}) }}>{p.children}</select>
);

// Componente de data: o <input type="date"> nativo do Android renderiza o texto
// no formato longo do sistema ("28 de jun. de 2026") com uma largura mínima que
// CSS não consegue controlar, estourando o layout. Aqui o texto visível é todo
// nosso (sempre dd/mm/aaaa, sempre do tamanho certo); o input nativo fica invisível
// e por cima, só para abrir o calendário do sistema ao tocar.
export const DateField = ({ value, onChange, style }) => {
  const fmt = (iso) => {
    if (!iso) return "Selecionar data";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  return (
    <div style={{ position: "relative", width: "100%", minWidth: 0 }}>
      <div style={{ ...inputBase, display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", ...(style || {}) }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{fmt(value)}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"
          style={{ flexShrink: 0, marginLeft: 8 }}>
          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      </div>
      <input type="date" value={value} onChange={onChange}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: 0, border: "none", padding: 0, margin: 0, cursor: "pointer" }} />
    </div>
  );
};

export const Btn = ({ children, onClick, kind = "primary", style, disabled }) => {
  const kinds = {
    primary: { background: `linear-gradient(135deg, ${C.sky}, ${C.royalDeep})`, color: "#fff",
      boxShadow: "0 6px 18px rgba(43,92,230,.35)" },
    ghost: { background: C.surface2, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.redDim}` },
    success: { background: `linear-gradient(135deg, #3ee69e, ${C.greenDim})`, color: "#06281a" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: 12, padding: "12px 17px",
      fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex",
      alignItems: "center", gap: 8, fontFamily: FONT_BODY, opacity: disabled ? .5 : 1,
      ...kinds[kind], ...style }}>{children}</button>
  );
};

export const Card = ({ children, style }) => (
  <div style={{ background: C.surface, backdropFilter: "blur(14px)", border: `1px solid ${C.borderSoft}`,
    borderRadius: 18, padding: 17, boxShadow: "0 10px 30px rgba(0,0,0,.25)", ...style }}>{children}</div>
);

export const SectionTitle = ({ icon: Icon, title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(43,92,230,.16)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={C.sky} />
      </div>
      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 600 }}>{title}</span>
    </div>
    {right}
  </div>
);

export const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: { bg: "rgba(91,134,255,.12)", fg: C.sky },
    good: { bg: "rgba(43,217,138,.12)", fg: C.green },
    bad: { bg: "rgba(255,91,110,.12)", fg: C.red },
    warn: { bg: "rgba(242,181,68,.14)", fg: C.amber },
  };
  const t = tones[tone];
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7,
      background: t.bg, color: t.fg, letterSpacing: ".03em", whiteSpace: "nowrap" }}>{children}</span>
  );
};

export const ListBlock = ({ title, empty, children }) => {
  const arr = React.Children.toArray(children);
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: ".09em", margin: "4px 4px 11px" }}>{title}</div>
      {arr.length === 0
        ? <Card style={{ textAlign: "center", color: C.dim, fontSize: 13, padding: 30 }}>{empty}</Card>
        : <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{arr}</div>}
    </div>
  );
};

export const Row = ({ children, onDelete, onClick }) => (
  <div onClick={onClick} style={{ background: C.surface, backdropFilter: "blur(10px)",
    border: `1px solid ${C.borderSoft}`, borderRadius: 14, padding: "13px 15px", display: "flex",
    alignItems: "center", justifyContent: "space-between", gap: 12, cursor: onClick ? "pointer" : "default" }}>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    {onDelete && (
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none",
        cursor: "pointer", color: C.dim, padding: 6, display: "flex", flexShrink: 0 }}>
        <TrashIcon />
      </button>
    )}
  </div>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const Kpi = ({ icon: Icon, label, value, sub, tone = "neutral" }) => {
  const col = tone === "good" ? C.green : tone === "bad" ? C.red : C.text;
  return (
    <Card style={{ padding: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, marginBottom: 9 }}>
        <Icon size={15} color={C.sky} />
        <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 25, fontWeight: 600, color: col, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.dim, marginTop: 6, fontFamily: FONT_MONO }}>{sub}</div>}
    </Card>
  );
};
