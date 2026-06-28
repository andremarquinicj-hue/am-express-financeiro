// src/components/Ajustes.jsx
import React, { useState, useEffect } from "react";
import { Truck, Download, Settings as SettingsIcon } from "lucide-react";
import { C } from "../theme";
import { Field, Input, Btn, Card, SectionTitle } from "./ui";
import { loadKey, saveKey } from "../lib/store";
import { today } from "../lib/format";

const DEFAULT_SETTINGS = { company: "AM Express", vehicle: "", plate: "" };
const KEY = "amx_fin_settings";

export default function Ajustes({ fin, contaInfo }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { (async () => { setSettings(await loadKey(KEY, DEFAULT_SETTINGS)); setLoaded(true); })(); }, []);
  useEffect(() => { if (loaded) saveKey(KEY, settings); }, [settings, loaded]);

  const set = (k, v) => setSettings((p) => ({ ...p, [k]: v }));

  const exportarBackup = () => {
    const payload = { cds: fin.cds, rotas: fin.rotas, recebiveis: fin.recebiveis,
      contasPagar: fin.contasPagar, abastecimentos: fin.abastecimentos, settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `am-express-backup-${today()}.json`;
    a.click();
  };

  return (
    <div className="pop">
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle icon={Truck} title="Empresa e veículo" />
        <Field label="Nome da transportadora">
          <Input value={settings.company} onChange={(e) => set("company", e.target.value)} style={{ fontFamily: "'Inter',sans-serif" }} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
          <Field label="Veículo"><Input placeholder="ex: Fiorino 2019" value={settings.vehicle} onChange={(e) => set("vehicle", e.target.value)} style={{ fontFamily: "'Inter',sans-serif" }} /></Field>
          <Field label="Placa"><Input placeholder="ABC1D23" value={settings.plate} onChange={(e) => set("plate", e.target.value)} /></Field>
        </div>
      </Card>

      {contaInfo && (
        <Card style={{ marginBottom: 16 }}>
          <SectionTitle icon={SettingsIcon} title="Conta" />
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>
            {contaInfo.email}
          </div>
          <Btn kind="ghost" onClick={contaInfo.sair}>Sair da conta</Btn>
        </Card>
      )}

      <Card>
        <SectionTitle icon={Download} title="Dados" />
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>
          {fin.rotas.length} rotas · {fin.recebiveis.length} recebíveis · {fin.contasPagar.length} contas a pagar · {fin.abastecimentos.length} abastecimentos
        </div>
        <Btn kind="ghost" onClick={exportarBackup}><Download size={15} />Exportar backup</Btn>
      </Card>
    </div>
  );
}
