FROM node:16 as client-builder
COPY ./server /opt/superbowlquiz/server
COPY ./client /opt/superbowlquiz/client
WORKDIR /opt/superbowlquiz/client
RUN npm install && \
    npm run build

FROM node:16 as server-builder
COPY ./server /opt/superbowlquiz/server
WORKDIR /opt/superbowlquiz/server
RUN npm install && \
    npm run build
RUN npm ci --production && \
    rm -f *.ts test tsconfig.json

FROM node:16 as production
COPY --from=client-builder /opt/superbowlquiz/client/dist /opt/superbowlquiz/client/dist
COPY --from=server-builder /opt/superbowlquiz/server /opt/superbowlquiz/server
USER node
WORKDIR /opt/superbowlquiz/server
ENTRYPOINT npm start
