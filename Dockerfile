FROM node:latest
RUN mkdir /opt/superbowlquiz
WORKDIR /opt/superbowlquiz
COPY . /opt/superbowlquiz
RUN npm install
ENTRYPOINT npm start
