FROM node:20-bullseye

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json 2>/dev/null || true
RUN npm install

COPY src/ ./src/
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

COPY .env* ./

COPY FRONTEND/uploads/ ./FRONTEND/uploads/

RUN npm run build 2>/dev/null || npx vite build
RUN npx tsc --build tsconfig.backend.json

RUN mkdir -p FRONTEND/uploads

EXPOSE 8080

CMD ["node", "dist/server.js"]