// src/components/Dashboard.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { Wallet, TrendingUp, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Gauge } from "lucide-react";
import { C } from "../theme";
import { Card, Kpi, ListBlock, Row, SectionTitle } from "./ui";
import { brl, fmtDateShort, today } from "../lib/format";
import { rotuloPeriodo } from "../lib/ciclos";

// addDaysSafe pode não existir em format.js — fallback local simples
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function Dashboard({ fin }) {
  const { cds, recebiveis, contasPagar, totais, cdById } = fin;
  const hoje = today();

  const fluxoProjetado = useMemo(() => {
    const dias = [];
    for (let i = -3; i <= 30; i++) dias.push(addDays(hoje, i));
    const porDia = {};
    dias.forEach((d) => (porDia[d] = { data: d, entra: 0, sai: 0 }));

    recebiveis.forEach((r) => {
      if (porDia[r.dataPrevista] && r.status === "a_receber") porDia[r.dataPrevista].entra += r.valorTotal;
      if (r.status === "recebido" && r.dataRecebimentoReal && porDia[r.dataRecebimentoReal])
        porDia[r.dataRecebimentoReal].entra += r.valorRecebidoReal ?? r.valorTotal;
    });
    contasPagar.forEach((c) => {
      if (c.status === "pendente" && porDia[c.dataVencimento]) porDia[c.dataVencimento].sai += c.valor;
      if (c.status === "pago" && c.dataPagamentoReal && porDia[c.dataPagamentoReal]) porDia[c.dataPagamentoReal].sai += c.valor;
    });

    let saldoAcumulado = totais.saldo;
    // recua o saldo inicial para o começo da janela (-3 dias) somando o que já passou antes disso
    return dias.map((d) => {
      const dia = porDia[d];
      saldoAcumulado += dia.entra - dia.sai;
      return { ...dia, label: fmtDateShort(d), saldo: saldoAcumulado, isHoje: d === hoje };
    });
  }, [recebiveis, contasPagar, totais.saldo, hoje]);

  const temSaldoNegativoFuturo = fluxoProjetado.some((d) => d.data >= hoje && d.saldo < 0);

  const recebiveisProx7 = recebiveis.filter((r) =>
    r.status === "a_receber" && r.dataPrevista >= hoje && r.dataPrevista <= addDays(hoje, 7)
  ).sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));

  const contasProx7 = contasPagar.filter((c) =>
    c.status === "pendente" && c.dataVencimento >= hoje && c.dataVencimento <= addDays(hoje, 7)
  ).sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));

  const porCD = useMemo(() => {
    return cds.map((cd) => {
      const recsCd = recebiveis.filter((r) => r.cdId === cd.id);
      const faturado = recsCd.reduce((s, r) => s + (r.status === "recebido" ? (r.valorRecebidoReal ?? r.valorTotal) : r.valorTotal), 0);
      const cicloAtual = recsCd.filter((r) => r.status === "a_receber").sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista))[0];
      return { cd, faturado, cicloAtual };
    }).filter((x) => x.faturado > 0 || x.cicloAtual);
  }, [cds, recebiveis]);

  return (
    <div className="pop">
      {/* SALDO HERO */}
      <div style={{ marginBottom: 14, borderRadius: 20, overflow: "hidden",
        border: `1px solid ${totais.saldo >= 0 ? "rgba(43,217,138,.3)" : "rgba(255,91,110,.3)"}`,
        boxShadow: "0 16px 40px rgba(0,0,0,.3)" }}>
        <div style={{ padding: 22, position: "relative", background: `linear-gradient(150deg, ${C.navy} 0%, #0a1330 70%)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Wallet size={17} color={C.sky} />
            <span style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, color: C.muted }}>Saldo consolidado</span>
          </div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 44, fontWeight: 700, lineHeight: .9,
            color: totais.saldo >= 0 ? C.green : C.red }}>{brl(totais.saldo)}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 12, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span><ArrowDownToLine size={13} style={{ verticalAlign: -2 }} /> Recebido {brl(totais.recebidoTotal)}</span>
            <span><ArrowUpFromLine size={13} style={{ verticalAlign: -2 }} /> Pago {brl(totais.pagoTotal)}</span>
          </div>
          {temSaldoNegativoFuturo && (
            <div style={{ marginTop: 14, background: "rgba(255,91,110,.12)", border: `1px solid ${C.redDim}`,
              borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: C.red, display: "flex", gap: 7, alignItems: "center" }}>
              <AlertTriangle size={14} /> O saldo projetado fica negativo em algum dia dos próximos 30 dias.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <Kpi icon={ArrowDownToLine} label="A receber" value={brl(totais.aReceberTotal)} tone="neutral" />
        <Kpi icon={ArrowUpFromLine} label="A pagar" value={brl(totais.aPagarTotal)} tone={totais.aPagarTotal > totais.aReceberTotal ? "bad" : "neutral"} />
      </div>

      {/* FLUXO PROJETADO */}
      <Card style={{ marginBottom: 14 }}>
        <SectionTitle icon={TrendingUp} title="Fluxo de caixa projetado" />
        <ResponsiveContainer width="100%" height={210}>
          <ComposedChart data={fluxoProjetado}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false}
              interval={Math.ceil(fluxoProjetado.length / 8)} />
            <YAxis tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v >= 1000 || v <= -1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
            <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 12 }}
              formatter={(v, n) => [brl(v), n === "saldo" ? "Saldo projetado" : n]} labelStyle={{ color: C.text }} />
            <ReferenceLine y={0} stroke={C.dim} strokeDasharray="3 3" />
            <Bar dataKey="entra" name="Entra" fill={C.green} radius={[3, 3, 0, 0]} barSize={6} />
            <Bar dataKey="sai" name="Sai" fill={C.red} radius={[3, 3, 0, 0]} barSize={6} />
            <Line type="monotone" dataKey="saldo" name="saldo" stroke={C.sky} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* POR CD */}
      {porCD.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <SectionTitle icon={Gauge} title="Por CD" />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {porCD.map(({ cd, faturado, cicloAtual }) => (
              <div key={cd.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(7,12,30,.4)", borderRadius: 12, padding: "11px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 32, borderRadius: 4, background: cd.cor }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{cd.nome}</div>
                    <div style={{ fontSize: 11.5, color: C.dim }}>
                      {cicloAtual
                        ? `${rotuloPeriodo(cicloAtual)} · previsto ${fmtDateShort(cicloAtual.dataPrevista)}`
                        : "Sem ciclo em aberto"}
                    </div>
                  </div>
                </div>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 600 }}>{brl(faturado)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* PRÓXIMOS 7 DIAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(255px,1fr))", gap: 14 }}>
        <ListBlock title="A receber em 7 dias" empty="Nada previsto.">
          {recebiveisProx7.map((r) => (
            <Row key={r.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 7, height: 30, borderRadius: 4, background: cdById(r.cdId)?.cor }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cdById(r.cdId)?.nome}<div style={{ fontSize: 11, color: C.dim, fontWeight: 400 }}>{fmtDateShort(r.dataPrevista)}</div></div>
              </div>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 600, color: C.green }}>{brl(r.valorTotal)}</span>
            </Row>
          ))}
        </ListBlock>
        <ListBlock title="A pagar em 7 dias" empty="Nada previsto.">
          {contasProx7.map((c) => (
            <Row key={c.id}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.categoria}<div style={{ fontSize: 11, color: C.dim, fontWeight: 400 }}>{fmtDateShort(c.dataVencimento)}</div></div>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 600, color: C.red }}>{brl(c.valor)}</span>
            </Row>
          ))}
        </ListBlock>
      </div>
    </div>
  );
}
