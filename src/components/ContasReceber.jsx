// src/components/ContasReceber.jsx
import React, { useState, useMemo } from "react";
import { Plus, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { C } from "../theme";
import { Field, Input, Select, Btn, Card, SectionTitle, Badge, ListBlock, Row, DateField } from "./ui";
import { brl, fnum, fmtDateFull, fmtDateShort, today, estaAtrasado, pnum } from "../lib/format";
import { rotuloPeriodo } from "../lib/ciclos";

export default function ContasReceber({ fin }) {
  const { cds, rotas, recebiveis, rotasSemCiclo, adicionarRota, excluirRota, confirmarRecebimento, reabrirRecebivel, cdById } = fin;
  const [aberto, setAberto] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroCd, setFiltroCd] = useState("todos");

  // Sincroniza o recebível aberto quando os dados mudam (ex: excluiu rota, valor mudou)
  const recebivelAtualizado = aberto ? (recebiveis.find((r) => r.id === aberto.id) || aberto) : null;

  if (aberto) {
    return (
      <DetalheRecebivel
        recebivel={recebivelAtualizado}
        cd={cdById(recebivelAtualizado.cdId)}
        rotas={rotas.filter((r) => r.recebivelId === recebivelAtualizado.id)}
        onVoltar={() => setAberto(null)}
        onConfirmar={confirmarRecebimento}
        onReabrir={reabrirRecebivel}
        onExcluirRota={(id) => {
          excluirRota(id);
          // Se era a última rota do recebível, volta pra lista
          const rotasRestantes = rotas.filter((r) => r.recebivelId === recebivelAtualizado.id && r.id !== id);
          if (rotasRestantes.length === 0) setAberto(null);
        }}
      />
    );
  }

  const listaFiltrada = recebiveis.filter((r) =>
    (filtroStatus === "todos" || r.status === filtroStatus) &&
    (filtroCd === "todos" || r.cdId === filtroCd)
  );

  // 10 rotas mais recentes para exibição direta com botão de excluir
  const rotasRecentes = [...rotas]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 10);

  return (
    <div className="pop">
      <NovaRota cds={cds} onAdicionar={adicionarRota} />

      {rotasSemCiclo.length > 0 && (
        <Card style={{ marginBottom: 16, borderColor: "rgba(242,181,68,.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <AlertTriangle size={16} color={C.amber} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>
              {rotasSemCiclo.length} rota(s) aguardando definição de ciclo
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            {[...new Set(rotasSemCiclo.map((r) => r.cdId))].map((cdId) => cdById(cdId)?.nome).join(", ")}{" "}
            ainda não têm regra de recebimento configurada. Vá em CDs para definir o ciclo.
          </div>
        </Card>
      )}

      {/* ROTAS RECENTES — com lixeira direta, sem precisar entrar no drill-down */}
      {rotasRecentes.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(43,92,230,.16)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={16} color={C.sky} />
            </div>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 600 }}>
              Rotas lançadas
            </span>
            <span style={{ fontSize: 11, color: C.dim, marginLeft: "auto" }}>toque 🗑 para excluir</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rotasRecentes.map((r) => {
              const cd = cdById(r.cdId);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(7,12,30,.45)", borderRadius: 12, padding: "11px 13px", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 6, height: 32, borderRadius: 3, background: cd?.cor || C.dim, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                        <span>{fmtDateShort(r.data)}</span>
                        <span style={{ color: C.muted, fontWeight: 400 }}>{cd?.nome}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: C.dim, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                        {r.packages} pct · {fnum(r.km)} km · {r.model === "pacote" ? `${brl(r.ratePkg)}/pct`
                          : r.model === "km" ? `${brl(r.rateKm)}/km`
                          : r.model === "misto" ? "pacote+km"
                          : "fechado"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 600, color: C.green }}>
                      {brl(r.valorCalculado)}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir rota de ${fmtDateShort(r.data)} (${cd?.nome}) — ${brl(r.valorCalculado)}?`)) {
                          excluirRota(r.id);
                        }
                      }}
                      style={{ background: "rgba(255,91,110,.12)", border: `1px solid ${C.redDim}`,
                        borderRadius: 9, padding: "7px 9px", cursor: "pointer", display: "flex",
                        alignItems: "center", color: C.red }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {rotas.length > 10 && (
            <div style={{ fontSize: 12, color: C.dim, textAlign: "center", marginTop: 10 }}>
              Mostrando as 10 mais recentes. Rotas mais antigas ficam no detalhe de cada recebível.
            </div>
          )}
        </Card>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ width: "auto", flex: 1 }}>
          <option value="todos">Todos os status</option>
          <option value="a_receber">A receber</option>
          <option value="recebido">Recebidos</option>
        </Select>
        <Select value={filtroCd} onChange={(e) => setFiltroCd(e.target.value)} style={{ width: "auto", flex: 1 }}>
          <option value="todos">Todos os CDs</option>
          {cds.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      </div>

      <ListBlock title={`Recebíveis (${listaFiltrada.length})`} empty="Nenhum recebível neste filtro.">
        {listaFiltrada.map((rec) => {
          const cd = cdById(rec.cdId);
          const atrasado = rec.status === "a_receber" && estaAtrasado(rec.dataPrevista);
          return (
            <Row key={rec.id} onClick={() => setAberto(rec)}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 7, height: 40, borderRadius: 4, background: cd?.cor || C.dim, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, display: "flex", alignItems: "center", gap: 7 }}>
                    {cd?.nome || "—"}
                    {rec.status === "recebido"
                      ? <Badge tone="good">RECEBIDO</Badge>
                      : atrasado ? <Badge tone="bad">ATRASADO</Badge> : <Badge tone="neutral">A RECEBER</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: C.dim, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                    {rotuloPeriodo(rec)} · previsto {fmtDateShort(rec.dataPrevista)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 600,
                  color: rec.status === "recebido" ? C.green : C.text }}>{brl(rec.valorTotal)}</span>
                <ChevronRight size={16} color={C.dim} />
              </div>
            </Row>
          );
        })}
      </ListBlock>
    </div>
  );
}

function NovaRota({ cds, onAdicionar }) {
  const [f, setF] = useState({ data: today(), cdId: cds[0]?.id || "", packages: "", km: "",
    model: "pacote", ratePkg: "", rateKm: "", fixed: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const computed = useMemo(() => {
    const pk = pnum(f.packages), km = pnum(f.km), rp = pnum(f.ratePkg), rk = pnum(f.rateKm), fx = pnum(f.fixed);
    if (f.model === "pacote") return pk * rp;
    if (f.model === "km") return km * rk;
    if (f.model === "misto") return pk * rp + km * rk;
    return fx;
  }, [f]);

  const add = () => {
    if (computed <= 0) return;
    onAdicionar({
      data: f.data, cdId: f.cdId, packages: pnum(f.packages), km: pnum(f.km),
      model: f.model, ratePkg: pnum(f.ratePkg), rateKm: pnum(f.rateKm), valorCalculado: computed,
    });
    setF((p) => ({ ...p, packages: "", km: "", fixed: "" }));
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <SectionTitle icon={Plus} title="Lançar rota" />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
        <Field label="Data"><DateField value={f.data} onChange={(e) => set("data", e.target.value)} /></Field>
        <Field label="CD (origem)">
          <Select value={f.cdId} onChange={(e) => set("cdId", e.target.value)}>
            {cds.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </Field>
        <Field label="Pacotes entregues"><Input inputMode="numeric" placeholder="0" value={f.packages} onChange={(e) => set("packages", e.target.value)} /></Field>
        <Field label="KM rodados"><Input inputMode="decimal" placeholder="0" value={f.km} onChange={(e) => set("km", e.target.value)} /></Field>
      </div>
      <Field label="Modelo de pagamento">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["pacote", "Por pacote"], ["km", "Por KM"], ["misto", "Pacote + KM"], ["fechado", "Valor fechado"]].map(([v, l]) => (
            <button key={v} onClick={() => set("model", v)} style={{ flex: "1 1 auto", padding: "10px",
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${f.model === v ? C.royal : C.border}`,
              background: f.model === v ? "rgba(43,92,230,.16)" : "rgba(7,12,30,.5)",
              color: f.model === v ? C.sky : C.muted }}>{l}</button>
          ))}
        </div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
        {(f.model === "pacote" || f.model === "misto") &&
          <Field label="R$ por pacote"><Input inputMode="decimal" placeholder="0,00" value={f.ratePkg} onChange={(e) => set("ratePkg", e.target.value)} /></Field>}
        {(f.model === "km" || f.model === "misto") &&
          <Field label="R$ por KM"><Input inputMode="decimal" placeholder="0,00" value={f.rateKm} onChange={(e) => set("rateKm", e.target.value)} /></Field>}
        {f.model === "fechado" &&
          <Field label="Valor da rota"><Input inputMode="decimal" placeholder="0,00" value={f.fixed} onChange={(e) => set("fixed", e.target.value)} /></Field>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(43,217,138,.08)", border: `1px solid ${C.greenDim}55`, borderRadius: 12,
        padding: "13px 15px", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: C.muted }}>Você vai receber</span>
        <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 700, color: C.green }}>{brl(computed)}</span>
      </div>
      <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} />Lançar rota</Btn>
    </Card>
  );
}

function DetalheRecebivel({ recebivel, cd, rotas, onVoltar, onConfirmar, onReabrir, onExcluirRota }) {
  const [dataReal, setDataReal] = useState(today());
  const [valorReal, setValorReal] = useState(String(recebivel.valorTotal.toFixed(2)).replace(".", ","));
  const recebido = recebivel.status === "recebido";

  return (
    <div className="pop">
      <button onClick={onVoltar} style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
        border: "none", color: C.sky, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: 0 }}>
        <ChevronLeft size={16} /> Voltar para Contas a Receber
      </button>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: cd?.cor || C.dim }} />
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 21, fontWeight: 600 }}>{cd?.nome}</span>
          {recebido ? <Badge tone="good">RECEBIDO</Badge> : <Badge tone="neutral">A RECEBER</Badge>}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
          Período {fmtDateFull(recebivel.periodoInicio)} a {fmtDateFull(recebivel.periodoFim)} · previsto para {fmtDateFull(recebivel.dataPrevista)}
        </div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 34, fontWeight: 700, color: recebido ? C.green : C.text, marginBottom: 18 }}>
          {brl(recebivel.valorTotal)}
          <span style={{ fontSize: 13, color: C.dim, fontWeight: 400, fontFamily: "'Inter',sans-serif" }}> previsto</span>
        </div>

        {!recebido ? (
          <div style={{ background: "rgba(7,12,30,.4)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
              <CheckCircle2 size={15} color={C.green} /> Confirmar recebimento
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
              <Field label="Data que recebeu"><DateField value={dataReal} onChange={(e) => setDataReal(e.target.value)} /></Field>
              <Field label="Valor recebido"><Input inputMode="decimal" value={valorReal} onChange={(e) => setValorReal(e.target.value)} /></Field>
            </div>
            <Btn kind="success" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => onConfirmar(recebivel.id, { dataReal, valorReal: pnum(valorReal) })}>
              <CheckCircle2 size={16} /> Marcar como recebido
            </Btn>
          </div>
        ) : (
          <div style={{ background: "rgba(43,217,138,.08)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
              Recebido em <b style={{ color: C.text }}>{fmtDateFull(recebivel.dataRecebimentoReal)}</b>, valor{" "}
              <b style={{ color: C.green }}>{brl(recebivel.valorRecebidoReal)}</b>
              {Math.abs(recebivel.valorRecebidoReal - recebivel.valorTotal) > 0.01 && (
                <span style={{ color: C.amber }}> (diferença de {brl(recebivel.valorRecebidoReal - recebivel.valorTotal)} vs. previsto)</span>
              )}
            </div>
            <Btn kind="ghost" onClick={() => onReabrir(recebivel.id)}><Clock size={14} /> Reabrir como pendente</Btn>
          </div>
        )}
      </Card>

      <ListBlock title={`Rotas neste período (${rotas.length})`} empty="Nenhuma rota encontrada.">
        {rotas.map((r) => (
          <Row key={r.id} onDelete={() => {
            if (window.confirm(`Excluir rota de ${fmtDateFull(r.data)} — ${brl(r.valorCalculado)}?`)) {
              onExcluirRota(r.id);
            }
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtDateFull(r.data)}</div>
              <div style={{ fontSize: 12, color: C.dim, fontFamily: "'JetBrains Mono',monospace" }}>
                {r.packages} pct · {fnum(r.km)} km</div>
            </div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 600, color: C.green }}>{brl(r.valorCalculado)}</div>
          </Row>
        ))}
      </ListBlock>
    </div>
  );
}

