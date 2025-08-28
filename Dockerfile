FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src/ ./src/
COPY tsconfig.json ./

COPY FRONTEND/react-dist/ ./FRONTEND/react-dist/
COPY FRONTEND/uploads/ ./FRONTEND/uploads/

COPY tsconfig.backend.json ./
RUN npx tsc --build tsconfig.backend.json

EXPOSE 8080
CMD ["node", "dist/server.js"]