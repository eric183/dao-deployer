FROM node:17-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock lerna.json ./
#COPY packages/server/package.json packages/server/
COPY packages/d42paas-official/package.json packages/d42paas-official/
COPY packages/client/package.json packages/client/

RUN yarn --only=production
RUN yarn bootstrap
COPY . .

RUN yarn start:web
RUN yarn start:next

FROM node:17-alpine

# current need nginx
RUN apk add --no-cache nginx && mkdir -p /run/nginx

# RUN printf 'server { listen 9001; server_name _; location / { root /app/packages/client/dist; index index.html; } }' > /etc/nginx/http.d/default.conf

WORKDIR /app

COPY package.json yarn.lock lerna.json ./
COPY packages/server/package.json packages/server/

RUN yarn --only=production
RUN yarn bootstrap
COPY packages/server /app/packages/server

# COPY --from=builder /app/packages/d42paas-official/.next/standalone /app/packages/d42paas-official/
COPY --from=builder /app/packages/d42paas-official/.next/ /app/packages/d42paas-official/.next/
COPY --from=builder /app/packages/client/dist /app/packages/client/dist

EXPOSE 9001 6006 3000 4001
# RUN yarn start
ENTRYPOINT ["sh", "-c", "nginx && yarn start:server"]

