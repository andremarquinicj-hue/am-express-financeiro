// src/components/CDs.jsx
import React, { useState } from "react";
import { Building2, Save, ChevronLeft } from "lucide-react";
import { C } from "../theme";
import { Field, Input, Select, Btn, Card, SectionTitle, Badge } from "./ui";
import { CICLO_LABELS, DOW_LABELS } from "../lib/ciclos";

export default function CDs({ fin }) {
  const { cds, atualizarCicloCD } = fin;
  const [editando, setEditando] = useState(null);

  if (editando) {
    return <EditarCiclo cd={editando} onSalvar={(ciclo) => { atualizarCicloCD(editando.id, ciclo); setEditando(null); }}
      onVoltar={() => setEditando(null)} />;
  }

  return (
    <div className="pop">
      <SectionTitle icon={Building2} title="Centros de Distribuição" />
      <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 16, lineHeight: 1.5 }}>
        Cada CD tem sua própria regra de quando o dinheiro cai. Configure o ciclo de cada um —
        as rotas lançadas se agrupam automaticamente conforme essa regra.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cds.map((cd) => (
          <Card key={cd.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: cd.cor, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#10131c",
                fontFamily: "'Oswald',sans-serif" }}>{cd.nome[0]}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{cd.nome}</div>
                <div style={{ marginTop: 4 }}>
                  {cd.ciclo.tipo === "nao_definido"
                    ? <Badge tone="warn">CICLO A DEFINIR</Badge>
                    : <Badge tone="neutral">{CICLO_LABELS[cd.ciclo.tipo]}</Badge>}
                </div>
              </div>
            </div>
            <Btn kind="ghost" onClick={() => setEditando(cd)}>Configurar</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EditarCiclo({ cd, onSalvar, onVoltar }) {
  const [tipo, setTipo] = useState(cd.ciclo.tipo === "nao_definido" ? "quinzenal_fixo" : cd.ciclo.tipo);
  const [diario, setDiario] = useState({ prazoDias: cd.ciclo.prazoDias ?? 2 });
  const [semanal, setSemanal] = useState({ corteDow: cd.ciclo.corteDow ?? 6, prazoDias: cd.ciclo.prazoDias ?? 5 });
  const [quinzenal, setQuinzenal] = useState({
    p1Fim: cd.ciclo.periodo1?.fimDia ?? 15,
    p1PagDia: cd.ciclo.periodo1?.pagamentoDia ?? 20,
    p1Offset: cd.ciclo.periodo1?.pagamentoMesOffset ?? 0,
    p2PagDia: cd.ciclo.periodo2?.pagamentoDia ?? 5,
    p2Offset: cd.ciclo.periodo2?.pagamentoMesOffset ?? 1,
  });
  const [dataFixa, setDataFixa] = useState({ diaPagamento: cd.ciclo.diaPagamento ?? 10, pagamentoMesOffset: cd.ciclo.pagamentoMesOffset ?? 1 });

  const salvar = () => {
    let ciclo;
    if (tipo === "diario") ciclo = { tipo, prazoDias: Number(diario.prazoDias) };
    else if (tipo === "semanal") ciclo = { tipo, corteDow: Number(semanal.corteDow), prazoDias: Number(semanal.prazoDias) };
    else if (tipo === "quinzenal_fixo") ciclo = { tipo,
      periodo1: { fimDia: Number(quinzenal.p1Fim), pagamentoDia: Number(quinzenal.p1PagDia), pagamentoMesOffset: Number(quinzenal.p1Offset) },
      periodo2: { pagamentoDia: Number(quinzenal.p2PagDia), pagamentoMesOffset: Number(quinzenal.p2Offset) } };
    else ciclo = { tipo, diaPagamento: Number(dataFixa.diaPagamento), pagamentoMesOffset: Number(dataFixa.pagamentoMesOffset) };
    onSalvar(ciclo);
  };

  const numInput = { width: 70, textAlign: "center" };

  return (
    <div className="pop">
      <button onClick={onVoltar} style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
        border: "none", color: C.sky, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}>
        <ChevronLeft size={16} /> Voltar para CDs
      </button>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: cd.cor }} />
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 600 }}>{cd.nome}</span>
        </div>

        <Field label="Tipo de ciclo">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="quinzenal_fixo">Quinzenal fixo</option>
            <option value="data_fixa">Data fixa do mês</option>
          </Select>
        </Field>

        {tipo === "diario" && (
          <div style={{ background: "rgba(7,12,30,.4)", borderRadius: 12, padding: 14, fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            Cada rota é paga
            <Input style={numInput} inputMode="numeric" value={diario.prazoDias} onChange={(e) => setDiario({ prazoDias: e.target.value })} />
            dia(s) depois da entrega.
          </div>
        )}

        {tipo === "semanal" && (
          <div style={{ background: "rgba(7,12,30,.4)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              Semana fecha no(a)
              <Select style={{ width: "auto" }} value={semanal.corteDow} onChange={(e) => setSemanal((s) => ({ ...s, corteDow: e.target.value }))}>
                {DOW_LABELS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </Select>
            </div>
            <div style={{ fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              e paga
              <Input style={numInput} inputMode="numeric" value={semanal.prazoDias} onChange={(e) => setSemanal((s) => ({ ...s, prazoDias: e.target.value }))} />
              dia(s) depois do fechamento.
            </div>
          </div>
        )}

        {tipo === "quinzenal_fixo" && (
          <div style={{ background: "rgba(7,12,30,.4)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sky, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>1º período</div>
              <div style={{ fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                Dia 1 até o dia <Input style={numInput} inputMode="numeric" value={quinzenal.p1Fim} onChange={(e) => setQuinzenal((q) => ({ ...q, p1Fim: e.target.value }))} />
                → paga no dia <Input style={numInput} inputMode="numeric" value={quinzenal.p1PagDia} onChange={(e) => setQuinzenal((q) => ({ ...q, p1PagDia: e.target.value }))} />
                <Select style={{ width: "auto" }} value={quinzenal.p1Offset} onChange={(e) => setQuinzenal((q) => ({ ...q, p1Offset: e.target.value }))}>
                  <option value={0}>do mesmo mês</option>
                  <option value={1}>do mês seguinte</option>
                </Select>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sky, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>2º período</div>
              <div style={{ fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                Dia seguinte até o fim do mês → paga no dia <Input style={numInput} inputMode="numeric" value={quinzenal.p2PagDia} onChange={(e) => setQuinzenal((q) => ({ ...q, p2PagDia: e.target.value }))} />
                <Select style={{ width: "auto" }} value={quinzenal.p2Offset} onChange={(e) => setQuinzenal((q) => ({ ...q, p2Offset: e.target.value }))}>
                  <option value={0}>do mesmo mês</option>
                  <option value={1}>do mês seguinte</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {tipo === "data_fixa" && (
          <div style={{ background: "rgba(7,12,30,.4)", borderRadius: 12, padding: 14, fontSize: 13.5, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            Tudo do mês paga no dia <Input style={numInput} inputMode="numeric" value={dataFixa.diaPagamento} onChange={(e) => setDataFixa((d) => ({ ...d, diaPagamento: e.target.value }))} />
            <Select style={{ width: "auto" }} value={dataFixa.pagamentoMesOffset} onChange={(e) => setDataFixa((d) => ({ ...d, pagamentoMesOffset: e.target.value }))}>
              <option value={0}>do mesmo mês</option>
              <option value={1}>do mês seguinte</option>
            </Select>
          </div>
        )}

        <div style={{ height: 16 }} />
        <Btn onClick={salvar} style={{ width: "100%", justifyContent: "center" }}><Save size={16} />Salvar ciclo</Btn>
      </Card>
    </div>
  );
}
