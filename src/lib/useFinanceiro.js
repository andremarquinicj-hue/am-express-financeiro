// src/lib/useFinanceiro.js
// Hook central de dados do sistema financeiro AM Express.
// Mantém CDs, rotas, recebíveis (agrupados automaticamente por ciclo),
// contas a pagar e abastecimentos — tudo persistido via loadKey/saveKey
// (que em produção aponta pro Firestore através de window.storage).

import { useState, useEffect, useMemo, useCallback } from "react";
import { loadKey, saveKey } from "./store";
import { calcularPeriodo } from "./ciclos";
import { uid, today } from "./format";
import { SEED_CDS } from "./seedCDs";

const KEYS = {
  cds: "amx_fin_cds",
  rotas: "amx_fin_rotas",
  recebiveis: "amx_fin_recebiveis",
  contasPagar: "amx_fin_contas_pagar",
  abastecimentos: "amx_fin_abastecimentos",
};

export function useFinanceiro() {
  const [loaded, setLoaded] = useState(false);
  const [cds, setCds] = useState(SEED_CDS);
  const [rotas, setRotas] = useState([]);
  const [recebiveis, setRecebiveis] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);

  useEffect(() => {
    (async () => {
      const loadedCds = await loadKey(KEYS.cds, null);
      setCds(loadedCds && loadedCds.length ? loadedCds : SEED_CDS);
      setRotas(await loadKey(KEYS.rotas, []));
      setRecebiveis(await loadKey(KEYS.recebiveis, []));
      setContasPagar(await loadKey(KEYS.contasPagar, []));
      setAbastecimentos(await loadKey(KEYS.abastecimentos, []));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveKey(KEYS.cds, cds); }, [cds, loaded]);
  useEffect(() => { if (loaded) saveKey(KEYS.rotas, rotas); }, [rotas, loaded]);
  useEffect(() => { if (loaded) saveKey(KEYS.recebiveis, recebiveis); }, [recebiveis, loaded]);
  useEffect(() => { if (loaded) saveKey(KEYS.contasPagar, contasPagar); }, [contasPagar, loaded]);
  useEffect(() => { if (loaded) saveKey(KEYS.abastecimentos, abastecimentos); }, [abastecimentos, loaded]);

  const cdById = useCallback((id) => cds.find((c) => c.id === id), [cds]);

  /**
   * Remove o valor de uma rota do recebível ao qual ela pertencia (uso: editar/excluir rota).
   */
  const removerValorDoRecebivel = useCallback((rota, listaRecebiveisAtual) => {
    if (!rota.recebivelId) return listaRecebiveisAtual;
    return listaRecebiveisAtual
      .map((r) => (r.id === rota.recebivelId ? { ...r, valorTotal: r.valorTotal - rota.valorCalculado } : r))
      .filter((r) => r.valorTotal > 0.005 || r.status === "recebido");
  }, []);

  const adicionarRota = useCallback((dadosRota) => {
    const rotaBase = { id: uid(), ...dadosRota };
    const cd = cdById(rotaBase.cdId);
    const periodo = cd ? calcularPeriodo(rotaBase.data, cd.ciclo) : null;

    if (!periodo) {
      setRotas((prev) => [{ ...rotaBase, recebivelId: null }, ...prev]);
      return;
    }

    setRecebiveis((listaAtual) => {
      const chaveCompleta = `${rotaBase.cdId}::${periodo.chave}`;
      const existente = listaAtual.find((r) => r.chave === chaveCompleta && r.status !== "recebido");
      if (existente) {
        setRotas((prev) => [{ ...rotaBase, recebivelId: existente.id }, ...prev]);
        return listaAtual.map((r) =>
          r.id === existente.id ? { ...r, valorTotal: r.valorTotal + rotaBase.valorCalculado } : r);
      }
      const novoId = uid();
      setRotas((prev) => [{ ...rotaBase, recebivelId: novoId }, ...prev]);
      const novo = {
        id: novoId, chave: chaveCompleta, cdId: rotaBase.cdId,
        periodoInicio: periodo.periodoInicio, periodoFim: periodo.periodoFim,
        dataPrevista: periodo.dataPrevista, valorTotal: rotaBase.valorCalculado,
        status: "a_receber", dataRecebimentoReal: null, valorRecebidoReal: null,
      };
      return [...listaAtual, novo];
    });
  }, [cdById]);

  const excluirRota = useCallback((rotaId) => {
    setRotas((prev) => {
      const rota = prev.find((r) => r.id === rotaId);
      if (rota) setRecebiveis((listaAtual) => removerValorDoRecebivel(rota, listaAtual));
      return prev.filter((r) => r.id !== rotaId);
    });
  }, [removerValorDoRecebivel]);

  const confirmarRecebimento = useCallback((recebivelId, { dataReal, valorReal }) => {
    setRecebiveis((prev) => prev.map((r) =>
      r.id === recebivelId
        ? { ...r, status: "recebido", dataRecebimentoReal: dataReal, valorRecebidoReal: valorReal }
        : r));
  }, []);

  const reabrirRecebivel = useCallback((recebivelId) => {
    setRecebiveis((prev) => prev.map((r) =>
      r.id === recebivelId ? { ...r, status: "a_receber", dataRecebimentoReal: null, valorRecebidoReal: null } : r));
  }, []);

  /**
   * Atualiza o ciclo de um CD. Se houver rotas já lançadas para esse CD cujo
   * ciclo era "nao_definido", reprocessa-as para gerar os recebíveis agora
   * que a regra existe.
   */
  const atualizarCicloCD = useCallback((cdId, novoCiclo) => {
    setCds((prev) => prev.map((c) => (c.id === cdId ? { ...c, ciclo: novoCiclo } : c)));
    setRotas((prevRotas) => {
      const pendentes = prevRotas.filter((r) => r.cdId === cdId && !r.recebivelId);
      if (!pendentes.length) return prevRotas;

      const idsPorRota = {};
      setRecebiveis((listaAtual) => {
        let lista = listaAtual;
        pendentes.forEach((rota) => {
          const periodo = calcularPeriodo(rota.data, novoCiclo);
          if (!periodo) return;
          const chaveCompleta = `${cdId}::${periodo.chave}`;
          const existente = lista.find((r) => r.chave === chaveCompleta && r.status !== "recebido");
          if (existente) {
            lista = lista.map((r) => (r.id === existente.id ? { ...r, valorTotal: r.valorTotal + rota.valorCalculado } : r));
            idsPorRota[rota.id] = existente.id;
          } else {
            const novo = { id: uid(), chave: chaveCompleta, cdId, periodoInicio: periodo.periodoInicio,
              periodoFim: periodo.periodoFim, dataPrevista: periodo.dataPrevista,
              valorTotal: rota.valorCalculado, status: "a_receber", dataRecebimentoReal: null, valorRecebidoReal: null };
            lista = [...lista, novo];
            idsPorRota[rota.id] = novo.id;
          }
        });
        return lista;
      });

      return prevRotas.map((r) => (idsPorRota[r.id] ? { ...r, recebivelId: idsPorRota[r.id] } : r));
    });
  }, []);

  const adicionarContaPagar = useCallback((dados) => {
    setContasPagar((prev) => [{ id: uid(), status: "pendente", dataPagamentoReal: null, ...dados }, ...prev]);
  }, []);
  const marcarContaPaga = useCallback((id, dataPagamentoReal = today()) => {
    setContasPagar((prev) => prev.map((c) => (c.id === id ? { ...c, status: "pago", dataPagamentoReal } : c)));
  }, []);
  const reabrirContaPagar = useCallback((id) => {
    setContasPagar((prev) => prev.map((c) => (c.id === id ? { ...c, status: "pendente", dataPagamentoReal: null } : c)));
  }, []);
  const excluirContaPagar = useCallback((id) => {
    setContasPagar((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const adicionarAbastecimento = useCallback((dados) => {
    const ab = { id: uid(), ...dados };
    setAbastecimentos((prev) => [ab, ...prev]);
    // Gera automaticamente uma conta a pagar (categoria Combustível), já paga por padrão
    adicionarContaPagar({
      categoria: "Combustível", descricao: `Abastecimento ${dados.litros}L`,
      valor: dados.total, dataVencimento: dados.data, recorrente: false,
      status: "pago", dataPagamentoReal: dados.data, origemAbastecimentoId: ab.id,
    });
  }, [adicionarContaPagar]);

  const excluirAbastecimento = useCallback((id) => {
    setAbastecimentos((prev) => prev.filter((a) => a.id !== id));
    setContasPagar((prev) => prev.filter((c) => c.origemAbastecimentoId !== id));
  }, []);

  // ---- Derivados ----
  const recebiveisOrdenados = useMemo(
    () => [...recebiveis].sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista)),
    [recebiveis]
  );
  const rotasSemCiclo = useMemo(() => rotas.filter((r) => !r.recebivelId), [rotas]);

  const totais = useMemo(() => {
    const recebidoTotal = recebiveis.filter((r) => r.status === "recebido")
      .reduce((s, r) => s + (r.valorRecebidoReal ?? r.valorTotal), 0);
    const aReceberTotal = recebiveis.filter((r) => r.status === "a_receber")
      .reduce((s, r) => s + r.valorTotal, 0);
    const pagoTotal = contasPagar.filter((c) => c.status === "pago").reduce((s, c) => s + c.valor, 0);
    const aPagarTotal = contasPagar.filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0);
    return { recebidoTotal, aReceberTotal, pagoTotal, aPagarTotal, saldo: recebidoTotal - pagoTotal };
  }, [recebiveis, contasPagar]);

  return {
    loaded, cds, rotas, recebiveis: recebiveisOrdenados, contasPagar, abastecimentos,
    rotasSemCiclo, totais, cdById,
    adicionarRota, excluirRota, confirmarRecebimento, reabrirRecebivel, atualizarCicloCD,
    adicionarContaPagar, marcarContaPaga, reabrirContaPagar, excluirContaPagar,
    adicionarAbastecimento, excluirAbastecimento,
  };
}
