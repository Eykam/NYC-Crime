FROM node:latest

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN yes | npm install -g npm
RUN yes | npm install

COPY ./ ./

CMD sleep 3 && node index.js