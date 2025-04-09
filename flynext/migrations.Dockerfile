FROM node:20-alpine

WORKDIR /flynext

COPY package*.json ./
RUN npm install --only=production

COPY prisma ./prisma

RUN npx prisma generate

CMD ["npx", "prisma", "migrate", "deploy"]