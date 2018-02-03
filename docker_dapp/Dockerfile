FROM node:8-alpine

RUN apk add --no-cache git python build-base

RUN npm i -g npm-run-all 
RUN npm i -g react-scripts 
RUN npm i -g --unsafe-perm  node-sass-chokidar

WORKDIR /usr/src/app

COPY entrypoint.sh /root/

ENTRYPOINT /root/entrypoint.sh 