// src/lib/ciclos.js
// Lógica central de ciclos de recebimento por CD.
// Dado um CD (com sua config de ciclo) e a data de uma rota, calcula:
//  - a chave do período (pra agrupar rotas no mesmo recebível)
//  - o início/fim do período
//  - a data prevista de pagamento
//
// Isso é o coração do Contas a Receber: cada rota lançada não fica solta,
// ela "cai" automaticamente dentro de um período/recebível do seu CD.

const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const lastDayOfMonth = (y, m) => new Date(y, m, 0).getDate(); // m = 1-12

function addMonths(y, m, delta) {
  const total = (m - 1) + delta;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12 + 1;
  return { y: ny, m: nm };
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Calcula o período/recebível ao qual uma rota pertence, dado o ciclo do CD.
 * @param {string} dataRota - "YYYY-MM-DD"
 * @param {object} ciclo - { tipo, ...config }
 * @returns {{ chave, periodoInicio, periodoFim, dataPrevista } | null}
 *          null quando o ciclo ainda não foi definido (CD "nao_definido")
 */
export function calcularPeriodo(dataRota, ciclo) {
  if (!ciclo || ciclo.tipo === "nao_definido") return null;
  const [y, m, d] = dataRota.split("-").map(Number);

  switch (ciclo.tipo) {
    case "diario": {
      const prazo = ciclo.prazoDias ?? 0;
      return {
        chave: `diario:${dataRota}`,
        periodoInicio: dataRota,
        periodoFim: dataRota,
        dataPrevista: addDays(dataRota, prazo),
      };
    }

    case "semanal": {
      // ciclo.corteDow: dia da semana em que a semana "fecha" (0-6)
      // ciclo.prazoDias: quantos dias depois do corte paga
      const corteDow = ciclo.corteDow ?? 0;
      const dt = new Date(y, m - 1, d);
      const dow = dt.getDay();
      const diasAteCorte = (corteDow - dow + 7) % 7;
      const fimSemana = addDays(dataRota, diasAteCorte);
      const inicioSemana = addDays(fimSemana, -6);
      const prazo = ciclo.prazoDias ?? 5;
      return {
        chave: `semanal:${fimSemana}`,
        periodoInicio: inicioSemana,
        periodoFim: fimSemana,
        dataPrevista: addDays(fimSemana, prazo),
      };
    }

    case "quinzenal_fixo": {
      // ciclo.periodo1: { fimDia, pagamentoDia, pagamentoMesOffset }
      // ciclo.periodo2: { fimDia (ou "ultimo"), pagamentoDia, pagamentoMesOffset }
      const p1 = ciclo.periodo1 || { fimDia: 15, pagamentoDia: 20, pagamentoMesOffset: 0 };
      const p2 = ciclo.periodo2 || { pagamentoDia: 5, pagamentoMesOffset: 1 };

      if (d <= p1.fimDia) {
        const pag = addMonths(y, m, p1.pagamentoMesOffset || 0);
        return {
          chave: `quinz1:${y}-${pad(m)}`,
          periodoInicio: iso(y, m, 1),
          periodoFim: iso(y, m, p1.fimDia),
          dataPrevista: iso(pag.y, pag.m, p1.pagamentoDia),
        };
      } else {
        const fim = lastDayOfMonth(y, m);
        const pag = addMonths(y, m, p2.pagamentoMesOffset ?? 1);
        return {
          chave: `quinz2:${y}-${pad(m)}`,
          periodoInicio: iso(y, m, p1.fimDia + 1),
          periodoFim: iso(y, m, fim),
          dataPrevista: iso(pag.y, pag.m, p2.pagamentoDia),
        };
      }
    }

    case "data_fixa": {
      // Todo lançamento do mês cai num único vencimento (ex: todo dia 10)
      const diaPagamento = ciclo.diaPagamento ?? 10;
      const offset = ciclo.pagamentoMesOffset ?? 1;
      const pag = addMonths(y, m, offset);
      const fim = lastDayOfMonth(y, m);
      return {
        chave: `fixa:${y}-${pad(m)}`,
        periodoInicio: iso(y, m, 1),
        periodoFim: iso(y, m, fim),
        dataPrevista: iso(pag.y, pag.m, diaPagamento),
      };
    }

    default:
      return null;
  }
}

/** Rótulo amigável em pt-BR para o período, usado nos cartões de recebível. */
export function rotuloPeriodo(p) {
  if (!p) return "A definir";
  const f = (iso) => { const [, m, d] = iso.split("-"); return `${d}/${m}`; };
  return `${f(p.periodoInicio)} – ${f(p.periodoFim)}`;
}

/** Descrição amigável do tipo de ciclo, para a tela de configuração de CD. */
export const CICLO_LABELS = {
  diario: "Diário",
  semanal: "Semanal",
  quinzenal_fixo: "Quinzenal fixo",
  data_fixa: "Data fixa do mês",
  nao_definido: "A definir",
};

export const DOW_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
