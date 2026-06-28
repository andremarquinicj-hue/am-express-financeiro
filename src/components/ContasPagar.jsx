// src/components/ContasPagar.jsx
import React, { useState, useMemo } from "react";
import { Plus, CheckCircle2, Clock, Fuel as FuelIcon } from "lucide-react";
import { C } from "../theme";
import { Field, Input, Select, Btn, Card, SectionTitle, Badge, ListBlock, Row, DateField } from "./ui";
import { brl, fnum, fmtDateShort, today, estaAtrasado, pnum } from "../lib/format";

const CATEGORIAS = ["Combustível", "Pedágio", "Manutenção", "IPVA", "Financiamento", "Seguro", "Outro"];

export default function ContasPagar({ fin }) {
  const { contasPagar, abastecimentos, adicionarContaPagar, marcarContaPaga, reabrirContaPagar,
    excluirContaPagar, adicionarAbastecimento, excluirAbastecimento } = fin;
  const [filtro, setFiltro] = useState("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

  const kmL = useMemo(() => {
    const sorted = [...abastecimentos].filter((f) => f.odometer > 0).sort((a, b) => a.odometer - b.odometer);
    let dist = 0, liters = 0;
    for (let i = 1; i < sorted.length; i++) {
      const d = sorted[i].odometer - sorted[i - 1].odometer;
      if (d > 0 && sorted[i].liters > 0) { dist += d; liters += sorted[i].liters; }
    }
    return liters ? dist / liters : 0;
  }, [abastecimentos]);

  const ordenadas = [...contasPagar].sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
  const filtradas = ordenadas.filter((c) =>
    (filtro === "todos" || c.status === filtro) &&
    (categoriaFiltro === "todas" || c.categoria === categoriaFiltro)
  );

  return (
    <div className="pop">
      <NovaDespesa onAdicionar={adicionarContaPagar} />
      <NovoAbastecimento kmL={kmL} onAdicionar={adicionarAbastecimento} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: "auto", flex: 1 }}>
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="pago">Pagos</option>
        </Select>
        <Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} style={{ width: "auto", flex: 1 }}>
          <option value="todas">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <ListBlock title={`Contas a pagar (${filtradas.length})`} empty="Nenhuma conta neste filtro.">
        {filtradas.map((c) => {
          const atrasada = c.status === "pendente" && estaAtrasado(c.dataVencimento);
          return (
            <Row key={c.id} onDelete={() => excluirContaPagar(c.id)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  {c.categoria}
                  {c.recorrente && <Badge tone="neutral">FIXA</Badge>}
                  {c.status === "pago" ? <Badge tone="good">PAGO</Badge> : atrasada ? <Badge tone="bad">ATRASADO</Badge> : <Badge tone="warn">PENDENTE</Badge>}
                </div>
                <div style={{ fontSize: 12, color: C.dim, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
                  vence {fmtDateShort(c.dataVencimento)}{c.descricao ? ` · ${c.descricao}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 600, color: C.red }}>{brl(c.valor)}</span>
                {c.status === "pendente"
                  ? <button onClick={() => marcarContaPaga(c.id)} title="Marcar como pago" style={{ background: "rgba(43,217,138,.14)",
                      border: `1px solid ${C.greenDim}`, borderRadius: 9, padding: 7, cursor: "pointer", display: "flex" }}>
                      <CheckCircle2 size={15} color={C.green} /></button>
                  : <button onClick={() => reabrirContaPagar(c.id)} title="Reabrir" style={{ background: "rgba(91,134,255,.12)",
                      border: `1px solid ${C.border}`, borderRadius: 9, padding: 7, cursor: "pointer", display: "flex" }}>
                      <Clock size={15} color={C.sky} /></button>}
              </div>
            </Row>
          );
        })}
      </ListBlock>

      <div style={{ height: 18 }} />
      <ListBlock title={`Histórico de abastecimentos (${abastecimentos.length})`} empty="Nenhum abastecimento lançado.">
        {abastecimentos.map((a) => (
          <Row key={a.id} onDelete={() => excluirAbastecimento(a.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <FuelIcon size={17} color={C.sky} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{fnum(a.liters, 2)} L · {brl(a.pricePerLiter)}/L</div>
                <div style={{ fontSize: 12, color: C.dim, fontFamily: "'JetBrains Mono',monospace" }}>
                  {fmtDateShort(a.data)}{a.odometer ? ` · ${fnum(a.odometer, 0)} km` : ""}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 17, fontWeight: 600, color: C.red }}>{brl(a.total)}</div>
          </Row>
        ))}
      </ListBlock>
    </div>
  );
}

function NovaDespesa({ onAdicionar }) {
  const [f, setF] = useState({ categoria: "Pedágio", descricao: "", valor: "",
    dataVencimento: today(), recorrente: false });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const add = () => {
    if (!pnum(f.valor)) return;
    onAdicionar({ categoria: f.categoria, descricao: f.descricao, valor: pnum(f.valor),
      dataVencimento: f.dataVencimento, recorrente: f.recorrente });
    setF((s) => ({ ...s, valor: "", descricao: "" }));
  };
  return (
    <Card style={{ marginBottom: 16 }}>
      <SectionTitle icon={Plus} title="Lançar despesa" />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
        <Field label="Categoria">
          <Select value={f.categoria} onChange={(e) => set("categoria", e.target.value)}>
            {CATEGORIAS.filter((c) => c !== "Combustível").map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Vencimento"><DateField value={f.dataVencimento} onChange={(e) => set("dataVencimento", e.target.value)} /></Field>
        <Field label="Valor"><Input inputMode="decimal" placeholder="0,00" value={f.valor} onChange={(e) => set("valor", e.target.value)} /></Field>
        <Field label="Observação"><Input placeholder="opcional" value={f.descricao} onChange={(e) => set("descricao", e.target.value)} style={{ fontFamily: "'Inter',sans-serif" }} /></Field>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={f.recorrente} onChange={(e) => set("recorrente", e.target.checked)} style={{ width: 18, height: 18, accentColor: C.royal }} />
        <span style={{ fontSize: 13, color: C.muted }}>Despesa fixa mensal (financiamento, seguro, IPVA...)</span>
      </label>
      <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} />Lançar despesa</Btn>
    </Card>
  );
}

function NovoAbastecimento({ kmL, onAdicionar }) {
  const [f, setF] = useState({ data: today(), price: "", liters: "", total: "", odometer: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const onPrice = (v) => { const p = pnum(v), t = pnum(f.total); setF((s) => ({ ...s, price: v, liters: p && t ? (t / p).toFixed(2).replace(".", ",") : s.liters })); };
  const onLiters = (v) => { const l = pnum(v), p = pnum(f.price); setF((s) => ({ ...s, liters: v, total: l && p ? (l * p).toFixed(2).replace(".", ",") : s.total })); };
  const onTotal = (v) => { const t = pnum(v), p = pnum(f.price); setF((s) => ({ ...s, total: v, liters: t && p ? (t / p).toFixed(2).replace(".", ",") : s.liters })); };
  const add = () => {
    if (!pnum(f.total) && !pnum(f.liters)) return;
    onAdicionar({ data: f.data, pricePerLiter: pnum(f.price), liters: pnum(f.liters),
      total: pnum(f.total) || pnum(f.liters) * pnum(f.price), odometer: pnum(f.odometer) });
    setF((s) => ({ ...s, liters: "", total: "", odometer: "" }));
  };
  return (
    <Card style={{ marginBottom: 16 }}>
      <SectionTitle icon={FuelIcon} title="Lançar abastecimento" right={kmL > 0 &&
        <span style={{ fontSize: 12, color: C.sky, fontFamily: "'JetBrains Mono',monospace" }}>{fnum(kmL)} km/l</span>} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
        <Field label="Data"><DateField value={f.data} onChange={(e) => set("data", e.target.value)} /></Field>
        <Field label="KM do painel" hint="Hodômetro total"><Input inputMode="decimal" placeholder="ex: 84210" value={f.odometer} onChange={(e) => set("odometer", e.target.value)} /></Field>
        <Field label="R$ por litro"><Input inputMode="decimal" placeholder="0,000" value={f.price} onChange={(e) => onPrice(e.target.value)} /></Field>
        <Field label="Litros"><Input inputMode="decimal" placeholder="0,00" value={f.liters} onChange={(e) => onLiters(e.target.value)} /></Field>
        <Field label="Valor pago (nota)"><Input inputMode="decimal" placeholder="0,00" value={f.total} onChange={(e) => onTotal(e.target.value)} /></Field>
      </div>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>
        Gera automaticamente uma conta a pagar (categoria Combustível), já marcada como paga.
      </div>
      <Btn onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} />Lançar abastecimento</Btn>
    </Card>
  );
}
