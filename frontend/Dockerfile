FROM node:latest

WORKDIR /app

COPY ./client/package.json ./package.json
COPY ./client/package-lock.json ./package-lock.json
COPY ./client/tsconfig.json ./tsconfig.json

RUN yes | npm install -g npm
RUN yes | npm install
