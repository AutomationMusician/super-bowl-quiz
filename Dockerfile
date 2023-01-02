FROM node:16 as client-builder
COPY ./server /usr/src/superbowlquiz/server
COPY ./client /usr/src/superbowlquiz/client
WORKDIR /usr/src/superbowlquiz/client
RUN npm install && \
    npm run build

FROM node:16 as server-builder
COPY ./server /usr/src/superbowlquiz/server
WORKDIR /usr/src/superbowlquiz/server
RUN npm install && \
    npm run build
RUN npm ci --omit=dev && \
    rm -rf src tsconfig.json

FROM node:16 as production
COPY --from=client-builder /usr/src/superbowlquiz/client/dist /usr/src/superbowlquiz/client/dist
COPY --from=server-builder /usr/src/superbowlquiz/server /usr/src/superbowlquiz/server
USER node
WORKDIR /usr/src/superbowlquiz/server
ENTRYPOINT npm start
