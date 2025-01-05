FROM node:20-alpine AS client-builder
COPY ./server /usr/src/superbowlquiz/server
COPY ./client /usr/src/superbowlquiz/client
WORKDIR /usr/src/superbowlquiz/client
RUN npm install && \
    npm run build

FROM node:20-alpine AS server-builder
COPY ./server /usr/src/superbowlquiz/server
WORKDIR /usr/src/superbowlquiz/server
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --omit=dev && \
    rm -rf *.ts test src tsconfig.json

FROM node:20-alpine AS production
COPY --from=client-builder /usr/src/superbowlquiz/client/dist /usr/src/superbowlquiz/client/dist
COPY --from=server-builder /usr/src/superbowlquiz/server /usr/src/superbowlquiz/server
USER node
WORKDIR /usr/src/superbowlquiz/server
EXPOSE 3000
ENTRYPOINT npm start
