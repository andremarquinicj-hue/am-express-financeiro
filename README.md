# AM Express — Financeiro

Sistema financeiro da transportadora AM Express: contas a pagar, contas a receber
agrupadas automaticamente por ciclo de cada CD, fluxo de caixa projetado, e acesso
multiusuário (André e Catrine, mesma empresa, contas separadas).

## O que tem aqui

- **Contas a Receber** — lança rota (por pacote / km / misto / fechado), o sistema
  agrupa automaticamente no recebível certo conforme o ciclo do CD de origem.
- **Contas a Pagar** — despesas com categoria, vencimento, status e recorrência
  mensal automática (financiamento, seguro, IPVA).
- **CDs cadastrados**: J&T Express e iMile (ciclo quinzenal já configurado:
  01–15 paga dia 20 / 16–fim paga dia 05 do mês seguinte), Mercado Livre e Shopee
  (ciclo em branco, configurável na tela CDs).
- **Painel** — saldo consolidado, fluxo de caixa projetado (30 dias), faturamento
  por CD, contas/recebíveis dos próximos 7 dias.
- **Login** — e-mail/senha ou Google. André e Catrine usam contas diferentes e
  veem os mesmos dados (ver `firestore.rules`).

## Stack

React (Create React App) + Firebase (Auth + Firestore) + Recharts + Lucide.
Mesmo padrão usado nos outros apps (IronCut, AM Express Rotas).

## Rodar localmente

```bash
npm install
npm start
```

Sem a config do Firebase em `src/db.js`, o app funciona com dados só nesta sessão
(útil para olhar a interface antes de configurar o backend).

## Deploy completo

Veja `MIGRACAO.md` para o passo a passo: Firebase, regras de segurança,
Vercel, e instalação no celular.

## Estrutura

```
src/
  App.jsx                 → navegação principal + 5 telas
  db.js                   → adaptador Firebase (login + Firestore)
  LoginGate.jsx           → tela de login
  theme.js                → cores e tokens de marca
  lib/
    ciclos.js             → cálculo de período/data prevista por tipo de ciclo
    seedCDs.js            → os 4 CDs pré-cadastrados
    useFinanceiro.js       → hook central: rotas, recebíveis, contas a pagar
    format.js, store.js    → helpers
  components/
    Dashboard.jsx, ContasReceber.jsx, ContasPagar.jsx, CDs.jsx, Ajustes.jsx, ui.jsx
public/
  manifest.json, sw.js, icons/   → PWA (instalável no celular)
firestore.rules            → regras de segurança (EDITE com os UIDs do André e da Catrine)
```
