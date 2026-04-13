FROM node:22-alpine
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar el cliente Prisma y buildear Next.js
# prisma migrate deploy NO va aquí: necesita DATABASE_URL que solo existe en runtime
RUN npx prisma generate && npx next build

EXPOSE 3000

# Al iniciar: migrar primero, luego arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
