#!/bin/bash

echo "🚀 Configurando ambiente de desenvolvimento PedBook..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Requer versão 18 ou superior."
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

if [ -d "node_modules" ]; then
    echo "🗑️  Removendo node_modules existente..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "🗑️  Removendo package-lock.json..."
    rm package-lock.json
fi

echo "🧹 Limpando cache do npm..."
npm cache clean --force

echo "📦 Instalando dependências..."
npm install

if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    cp .envexemple .env
fi

echo "🔨 Fazendo build do projeto..."
npm run build

echo "✅ Configuração concluída!"
echo ""
echo "Para rodar em desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para rodar com Docker:"
echo "  ./docker-rebuild.sh"
