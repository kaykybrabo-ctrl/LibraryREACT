FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy only backend source files and config
COPY src/ ./src/
COPY tsconfig.json ./

# Copy pre-built React app
COPY FRONTEND/react-dist/ ./FRONTEND/react-dist/
COPY FRONTEND/uploads/ ./FRONTEND/uploads/

# Copy backend-specific tsconfig and build only the backend
COPY tsconfig.backend.json ./
RUN npx tsc --build tsconfig.backend.json

EXPOSE 8080
CMD ["node", "dist/server.js"]