FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY .env ./

COPY FRONTEND/uploads/ ./FRONTEND/uploads/

RUN npx vite build
RUN npx tsc --build tsconfig.backend.json

EXPOSE 8080
CMD ["node", "dist/server.js"]