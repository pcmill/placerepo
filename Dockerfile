FROM node:18-alpine as builder

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk -U upgrade
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:18-alpine

COPY --from=builder node_modules node_modules
COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

EXPOSE 8881

CMD [ "npm", "run", "start" ]