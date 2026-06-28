# AM Express — Financeiro: passo a passo completo

## 1. Instalar dependências

```bash
npm install
```

## 2. Criar o projeto no Firebase

Em [console.firebase.google.com](https://console.firebase.google.com) → "Adicionar projeto".

Dentro do projeto:
- **Firestore Database** → Criar banco de dados → modo produção.
- **Authentication** → aba "Sign-in method" → ative **E-mail/senha** e **Google**.
- **Configurações do projeto** → "Seus apps" → ícone Web (`</>`) → registre um app
  → copie o objeto `firebaseConfig`.

Cole esse `firebaseConfig` dentro de `src/db.js`, no lugar de `SUA_API_KEY` etc.

## 3. Criar as contas de André e Catrine

No app (`npm start`), na tela de login, clique em "Criar agora" e crie as duas contas
(uma para você, uma para a Catrine) — pode ser e-mail/senha ou Google, cada um escolhe.

## 4. Pegar o UID de cada um e travar a segurança

No Firebase Console → Authentication → aba "Users", você vê os dois usuários criados.
Copie o **UID** de cada um (uma string longa, tipo `aB3xY...`).

Abra `firestore.rules` e troque:

```
"COLE_AQUI_O_UID_DO_ANDRE",
"COLE_AQUI_O_UID_DA_CATRINE"
```

pelos UIDs reais. **Esse passo é o que garante que só vocês dois acessam os dados** —
sem ele, qualquer pessoa que criasse uma conta no app veria as informações financeiras
da empresa.

No Firestore → aba "Regras", cole o conteúdo atualizado de `firestore.rules` e publique.

## 5. Testar localmente

```bash
npm start
```

Abre em `localhost:3000`. Entre com uma das contas, lance uma rota de teste (Contas a
Receber) e uma despesa (Contas a Pagar). Confirme no Firestore (Dados → `empresas/am-express/kv`)
que está salvando. Saia e entre com a outra conta — os mesmos dados devem aparecer.

## 6. Publicar na Vercel

```bash
npm install -g vercel
vercel --prod
```

Ou suba para o GitHub e importe o repositório na Vercel — ela detecta Create React App
automaticamente.

## 7. Autorizar o domínio publicado (passo que mais trava gente)

Firebase → Authentication → Settings → **Authorized domains** → adicione a URL da
Vercel (ex: `am-express-financeiro.vercel.app`). Sem isso, o login com Google é
bloqueado no site publicado.

## 8. Instalar no celular

Abra a URL da Vercel no celular.
- **Android (Chrome):** menu ⋮ → "Instalar app".
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início".

O ícone do caminhão aparece como app em tela cheia. André e Catrine entram cada um
com sua conta e veem os mesmos dados, em tempo real.

## Onde costuma travar

- Esquecer de trocar os UIDs de exemplo no `firestore.rules` (login funciona, mas
  leitura/escrita falha com erro de permissão).
- Esquecer o domínio autorizado no passo 7 (login com Google falha só em produção).
- Colar o `firebaseConfig` errado ou de outro projeto.

Se der erro em qualquer etapa, a mensagem de erro do Firebase geralmente diz exatamente
o que falta — pode copiar e colar aqui que eu ajudo a resolver.
