# PRiDeRing MVP

<img width="1198" height="1313" alt="ChatGPT Image 1 de ago  de 2026, 21_56_39" src="https://github.com/user-attachments/assets/1253b663-7407-4af8-9fb0-34d564d9c549" />


Este pacote contém as páginas HTML com CSS e JavaScript externos.

## Estrutura

- `css/global.css`: reset, variáveis e regras globais.
- `css/responsive.css`: regras responsivas compartilhadas.
- `css/<pagina>.css`: estilos exclusivos de cada página.
- `javascript/storage.js`: persistência local.
- `javascript/api.js`: camada de API/mock.
- `javascript/<pagina>.js`: comportamento específico de cada página.
- `javascript/scanner.js`: módulo reutilizável de reconhecimento NFC.

## Referências por página

| Página | CSS específico | JavaScript específico |
|---|---|---|
| login.html | css/login.css | javascript/login.js |
| cadastro.html | css/cadastro.css | javascript/cadastro.js |
| dashboard.html | css/dashboard.css | javascript/dashboard.js |
| perfil.html | css/perfil.css | javascript/perfil.js |
| cadastrar-nfc.html | css/cadastrar-nfc.css | javascript/nfc.js |
| compartilhar.html | css/compartilhar.css | javascript/compartilhar.js |
| perfil-publico.html | css/perfil-publico.css | javascript/perfil-publico.js |
| configuracoes.html | css/configuracoes.css | javascript/configuracoes.js |

Cada página também carrega `css/global.css`, `css/responsive.css`,
`javascript/storage.js` e `javascript/api.js`.

## Execução

Abra a pasta no VS Code e execute com a extensão Live Server.
Para testar Web NFC, use um navegador/dispositivo compatível e uma origem segura
(HTTPS). A simulação do MVP continua disponível na página de cadastro NFC.
