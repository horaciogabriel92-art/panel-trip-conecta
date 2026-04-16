# Dockerfile para Next.js 16 (Panel)
FROM node:22-alpine AS base

# Instalar dependencias del sistema necesarias para build
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar package files e instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Imagen final
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copiar solo lo necesario desde el builder
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
