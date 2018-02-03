FROM node:8-alpine

RUN apk add --no-cache git python build-base

RUN npm install -g mkdirp

WORKDIR /usr/src/app

COPY entrypoint.sh /root/

ENTRYPOINT /root/entrypoint.sh 