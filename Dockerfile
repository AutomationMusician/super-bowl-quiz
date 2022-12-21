FROM node:16 as build
RUN mkdir /opt/superbowlquiz
WORKDIR /opt/superbowlquiz
COPY . /opt/superbowlquiz
RUN npm install

FROM node:16 as production
USER node
COPY --from=build /opt/superbowlquiz /opt/superbowlquiz
WORKDIR /opt/superbowlquiz
ENTRYPOINT npm start
