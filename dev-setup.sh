#!/bin/bash

echo "Configurando ambiente de desenvolvimento..."

if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERRO: Node.js versão $NODE_VERSION encontrada. Requer versão 18+."
    exit 1
fi

echo "Node.js $(node -v) encontrado"

if [ -d "node_modules" ]; then
    echo "Removendo node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "Removendo package-lock.json..."
    rm package-lock.json
fi

echo "Limpando cache npm..."
npm cache clean --force

echo "Instalando dependências..."
npm install

if [ ! -f ".env" ]; then
    echo "Criando arquivo .env..."
    cp .envexemple .env
fi

echo "Fazendo build..."
npm run build

echo "Configuração concluída!"
echo ""
echo "Para rodar:"
echo "  npm run dev (desenvolvimento)"
echo "  ./docker-rebuild.sh (Docker)"
