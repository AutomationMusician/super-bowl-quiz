FROM node:14 as build
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install \
    && npm run build

FROM node:14 as production
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/package.json /usr/src/app/package.json
COPY --from=build /usr/src/app/Readme.md /usr/src/app/Readme.md
WORKDIR /usr/src/app
ENTRYPOINT npm start
