// src/lib/seedCDs.js
// CDs pré-cadastrados, conforme especificado: J&T e iMile já vêm com o ciclo
// quinzenal fixo (01-15 -> paga dia 20 / 16-fim -> paga dia 05 do mês seguinte),
// configurados de forma INDEPENDENTE um do outro (mesma regra hoje, mas cada um
// pode ser editado sem afetar o outro). Mercado Livre e Shopee entram sem ciclo
// definido, para configurar depois.

export const SEED_CDS = [
  {
    id: "jt",
    nome: "J&T Express",
    cor: "#E2231A",
    ativo: true,
    ciclo: {
      tipo: "quinzenal_fixo",
      periodo1: { fimDia: 15, pagamentoDia: 20, pagamentoMesOffset: 0 },
      periodo2: { pagamentoDia: 5, pagamentoMesOffset: 1 },
    },
  },
  {
    id: "imile",
    nome: "iMile",
    cor: "#FF6A00",
    ativo: true,
    ciclo: {
      tipo: "quinzenal_fixo",
      periodo1: { fimDia: 15, pagamentoDia: 20, pagamentoMesOffset: 0 },
      periodo2: { pagamentoDia: 5, pagamentoMesOffset: 1 },
    },
  },
  {
    id: "mercadolivre",
    nome: "Mercado Livre",
    cor: "#FFE600",
    ativo: true,
    ciclo: { tipo: "nao_definido" },
  },
  {
    id: "shopee",
    nome: "Shopee",
    cor: "#EE4D2D",
    ativo: true,
    ciclo: { tipo: "nao_definido" },
  },
];
