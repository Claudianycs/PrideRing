# PRiDeRing MVP

<img width="1198" height="1313" alt="ChatGPT Image 1 de ago  de 2026, 21_56_39" src="https://github.com/user-attachments/assets/1253b663-7407-4af8-9fb0-34d564d9c549" />


Este pacote contém as páginas HTML com CSS e JavaScript externos, com Supabase
(Postgres + Auth) como banco de dados real — não é mais um mock em localStorage.

## Estrutura

- `css/global.css`: reset, variáveis e regras globais.
- `css/responsive.css`: regras responsivas compartilhadas.
- `css/<pagina>.css`: estilos exclusivos de cada página.
- `javascript/supabaseClient.js`: configuração de conexão com o Supabase (URL + chave pública).
- `javascript/auth.js`: helpers de sessão (`requireSession`, `redirectIfLoggedIn`, `signOutAndRedirect`).
- `javascript/<pagina>.js`: comportamento específico de cada página.
- `javascript/scanner.js`: módulo reutilizável de reconhecimento NFC.
- `supabase/schema.sql`: schema completo do banco (tabelas, RLS e trigger de criação de conta).

## Banco de dados (Supabase)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de `supabase/schema.sql`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**
   e cole em `javascript/supabaseClient.js` (`SUPABASE_URL` e `SUPABASE_ANON_KEY`).
   Essa chave é pública por padrão no Supabase — a segurança dos dados é garantida
   pelas políticas de Row Level Security definidas no schema, não pelo sigilo dela.

## Fluxo de NFC
- `cadastrar-nfc.html` (+ `javascript/nfc.js`): vincula o serial da tag do seu anel à sua conta (tabela `nfc_tags`).
- `ler-nfc.html` (+ `javascript/scanner.js`): lê o serial de uma tag, busca no banco de quem é o anel
  e abre `perfil-publico.html?u=<id>` com o perfil público dessa pessoa — funciona entre celulares diferentes.

## Execução
Abra a pasta no VS Code e execute com a extensão Live Server.
Para testar Web NFC, use um navegador/dispositivo compatível (Chrome no Android)
e uma origem segura (HTTPS) — Web NFC não funciona em `http://` nem fora do Android/Chrome.
Em qualquer outro navegador/dispositivo, use o botão "Simular leitura" disponível
tanto no cadastro quanto na leitura de NFC para testar o fluxo completo do MVP.

Clique aqui para acessar o site: https://claudianycs.github.io/PrideRing/
