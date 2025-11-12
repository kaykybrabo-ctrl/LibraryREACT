#!/bin/bash

echo "🐳 Reconstruindo PedBook com Docker..."

echo "⏹️  Parando containers existentes..."
docker compose down

echo "🗑️  Removendo imagens antigas..."
docker compose down --rmi all --volumes --remove-orphans

echo "🔨 Reconstruindo e iniciando containers..."
docker compose up --build -d

echo "📋 Mostrando logs dos containers..."
docker compose logs -f

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: http://localhost:8080"
echo "🗄️  phpMyAdmin disponível em: http://localhost:8081"
