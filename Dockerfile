FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build
RUN cp -r src/generated dist/generated

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./dist/generated
COPY --from=builder /app/src ./src
COPY prisma ./prisma

EXPOSE 3010
CMD ["npm", "run", "start:prod"]
