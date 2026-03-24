FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "-c", "until npx prisma migrate deploy; do echo 'Waiting for database...'; sleep 2; done && npm run prisma:seed && npm run dev"]
