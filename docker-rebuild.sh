
#!/bin/bash

echo "Parando containers..."
docker compose down

echo "Limpando cache e volumes..."
docker compose down --rmi all --volumes --remove-orphans

echo "Reconstruindo aplicação..."
docker compose up --build -d

echo "Sistema rodando em: http://localhost:8080"
echo "phpMyAdmin disponível em: http://localhost:8081"
