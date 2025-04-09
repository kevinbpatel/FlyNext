FROM node:20-alpine AS builder
WORKDIR /flynext

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /flynext

COPY --from=builder /flynext/.next ./.next
COPY --from=builder /flynext/public ./public
COPY --from=builder /flynext/package.json ./
COPY --from=builder /flynext/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /flynext/prisma ./prisma
COPY --from=builder /flynext/scripts ./scripts

RUN npm install --only=production

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]