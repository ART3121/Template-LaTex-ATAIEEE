#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v npm >/dev/null 2>&1; then
  echo "Erro: npm nao encontrado. Instale Node.js antes de continuar." >&2
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Instalando dependencias..."
  (
    cd "$ROOT_DIR"
    npm install
  )
fi

if [ ! -f "$ROOT_DIR/public/swiftlatex/PdfTeXEngine.js" ]; then
  echo "Erro: runtime do SwiftLaTeX nao encontrado em public/swiftlatex." >&2
  exit 1
fi

if [ ! -f "$ROOT_DIR/texlive/local/pdftex/manifest.json" ]; then
  echo "Preparando bundle local do TeX para o SwiftLaTeX..."
  (
    cd "$ROOT_DIR"
    npm run vendor:texlive
  )
fi

cd "$ROOT_DIR"
exec npm run dev
