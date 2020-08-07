FROM ubuntu:20.04

RUN mkdir -p /usr/src/app

FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]

