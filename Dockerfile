FROM --platform=linux/amd64 node:20-alpine

LABEL authors="NaN"

WORKDIR /app
RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
RUN rm -f .env.local

CMD ["pnpm", "start"]