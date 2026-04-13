# Template de Atas IEEE

Projeto migrado para uma arquitetura React full-stack com Next.js.

Agora a aplicacao roda a partir da raiz do repositorio:

- interface web em React
- rotas de API no proprio Next.js
- geracao de `.tex` e compilacao de `.pdf` no navegador com SwiftLaTeX
- classes LaTeX preservadas em `classes/`

## Visao Geral

O fluxo principal ficou assim:

1. o usuario abre a interface React em `http://localhost:3000`
2. preenche os dados da reuniao
3. envia anexos e solicita a geracao
4. o app carrega o template da sociedade e os assets visuais
5. o navegador monta o `.tex`
6. o SwiftLaTeX gera o formato local do `PdfTeX` no navegador e compila o documento em WebAssembly
7. o PDF pronto volta para download no navegador

## Stack Atual

- `React 19`
- `Next.js 16`
- `Node.js`
- `SwiftLaTeX` no navegador para a compilacao final do PDF

## Estrutura

```text
Template-LaTex-ATAIEEE/
├── classes/
├── exemplos/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.js
│   │   │   ├── latex/project/route.js
│   │   │   └── sociedades/route.js
│   │   │   └── swiftlatex/texlive/[engine]/[...slug]/route.js
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   └── AtaApp.jsx
│   └── lib/
│       ├── ata.js
│       └── swiftlatex-client.js
├── public/
│   └── swiftlatex/
├── web_atas/
├── package.json
└── start_web.sh
```

## Requisitos

- `Node.js 20.9+`
- `npm`

## Instalacao

Na raiz do projeto:

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Se precisar regenerar manualmente o bundle local de pacotes TeX usado pelo SwiftLaTeX:

```bash
npm run vendor:texlive
```

Depois disso, abra:

- `http://127.0.0.1:3000`

## Producao

```bash
npm run build
npm start
```

## Endpoints

- `GET /api/health`
- `GET /api/sociedades`
- `GET /api/latex/project`
- `GET /api/swiftlatex/texlive/:engine/:arquivo`

## Sociedades Suportadas

- `AESS`
- `APS`
- `CS`
- `EdSoc`
- `IAS`
- `MTTS`
- `PES`
- `RAS`
- `Ramo Geral`
- `VTS`

## Observacoes

- As classes `.cls`, logos e identidade visual continuam centralizados em `classes/`.
- A compilacao do PDF acontece no browser; o backend nao executa `pdflatex`.
- Os pacotes TeX sao servidos a partir do bundle local em `texlive/local/` pelo proxy do proprio app.
- O `swiftlatexpdftex.fmt` e gerado no navegador para ficar compativel com o bundle local de pacotes.
- O `start_web.sh` valida os assets do SwiftLaTeX e gera `texlive/local/pdftex/manifest.json` automaticamente se ele ainda nao existir.
- A implementacao anterior em `web_atas/` foi mantida como referencia durante a migracao.
- O exemplo de payload continua em `exemplos/dados_exemplo.json`.
