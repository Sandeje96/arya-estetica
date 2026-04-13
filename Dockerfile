FROM node:22-alpine
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar el cliente Prisma y buildear Next.js
RUN npx prisma generate && npx next build

# Script de arranque
RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]
