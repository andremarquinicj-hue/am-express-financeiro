// src/LoginGate.jsx
// Tela de login da AM Express. Libera o app só depois que André OU Catrine
// (qualquer um dos dois, contas separadas) entra com e-mail/senha ou Google.

import React, { useState, useEffect } from "react";
import { watchUser, entrarEmail, criarConta, entrarGoogle } from "./db";
import { C } from "./theme";

const traduzErro = (code = "") => {
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "E-mail ou senha incorretos.";
  if (code.includes("email-already-in-use")) return "Esse e-mail já tem conta. Tente entrar.";
  if (code.includes("weak-password")) return "A senha precisa de pelo menos 6 caracteres.";
  if (code.includes("invalid-email")) return "E-mail inválido.";
  if (code.includes("popup-closed")) return "Login cancelado.";
  return "Não foi possível continuar. Tente de novo.";
};

export default function LoginGate({ children }) {
  const [user, setUser] = useState(undefined);
  const [mode, setMode] = useState("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => watchUser((u) => setUser(u || null)), []);

  const submit = async () => {
    setErro(""); setBusy(true);
    try {
      if (mode === "entrar") await entrarEmail(email.trim(), senha);
      else await criarConta(email.trim(), senha);
    } catch (e) { setErro(traduzErro(e.code || "")); }
    setBusy(false);
  };
  const google = async () => {
    setErro(""); setBusy(true);
    try { await entrarGoogle(); } catch (e) { setErro(traduzErro(e.code || "")); }
    setBusy(false);
  };

  if (user === undefined) return <Splash />;
  if (user) return children({ email: user.email, sair: () => window.__amxLogout?.() });

  const input = {
    width: "100%", boxSizing: "border-box", background: "rgba(7,12,30,.6)",
    border: "1px solid rgba(91,134,255,.2)", borderRadius: 12, color: C.text,
    padding: "14px 15px", fontSize: 15, outline: "none", marginBottom: 12,
    fontFamily: "'Inter',sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Inter',sans-serif", color: C.text,
      background: `radial-gradient(900px 500px at 80% -10%, rgba(43,92,230,.22), transparent 60%), ${C.bg}` }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder{color:${C.dim}}`}</style>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "12px 20px",
            boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
            <img src="/icons/logo.png" alt="AM Express" style={{ height: 34, display: "block" }} />
          </div>
        </div>

        <div style={{ background: "rgba(20,30,68,.55)", backdropFilter: "blur(14px)",
          border: "1px solid rgba(91,134,255,.12)", borderRadius: 20, padding: 22,
          boxShadow: "0 16px 40px rgba(0,0,0,.3)" }}>
          <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>
            {mode === "entrar" ? "Entrar na operação" : "Criar sua conta"}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 20px" }}>
            André e Catrine acessam os mesmos dados, cada um com sua própria conta.
          </p>

          <input style={input} type="email" placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input style={input} type="password" placeholder="Senha" value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"} />

          {erro && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{erro}</div>}

          <button onClick={submit} disabled={busy} style={{ width: "100%", border: "none",
            borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer",
            color: "#fff", background: `linear-gradient(135deg,${C.sky},${C.royalDeep})`,
            boxShadow: "0 6px 18px rgba(43,92,230,.35)", opacity: busy ? .6 : 1 }}>
            {busy ? "..." : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: C.dim, fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(91,134,255,.15)" }} />ou<div style={{ flex: 1, height: 1, background: "rgba(91,134,255,.15)" }} />
          </div>

          <button onClick={google} disabled={busy} style={{ width: "100%", borderRadius: 12,
            padding: "13px", fontWeight: 600, fontSize: 14.5, cursor: "pointer", color: C.text,
            background: "rgba(7,12,30,.5)", border: "1px solid rgba(91,134,255,.2)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <GoogleIcon /> Entrar com Google
          </button>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
            {mode === "entrar" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => { setMode(mode === "entrar" ? "criar" : "entrar"); setErro(""); }}
              style={{ background: "none", border: "none", color: C.sky, cursor: "pointer",
                fontWeight: 700, fontSize: 13 }}>
              {mode === "entrar" ? "Criar agora" : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Splash = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#070C1E" }}>
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 20px" }}>
      <img src="/icons/logo.png" alt="AM Express" style={{ height: 30, display: "block" }} />
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C36.7 6.1 30.7 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5c11.3 0 20.5-9.2 20.5-20.5 0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13.5 24 13.5c3.1 0 5.8 1.1 7.9 3l5.7-5.7C36.7 6.1 30.7 3.5 24 3.5 16.3 3.5 9.6 7.9 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44.5c6.5 0 12.4-2.5 16.9-6.5l-6.2-5.3c-2.3 1.8-5.3 2.8-8.7 2.8-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 40 16.2 44.5 24 44.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.5l6.2 5.3c4.1-3.8 6.9-9.4 6.9-16.3 0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);
