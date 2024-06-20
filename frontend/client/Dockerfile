FROM node:latest

WORKDIR /app

COPY ./frontend/package.json ./package.json
COPY ./frontend/package-lock.json ./package-lock.json

RUN yes | npm install -g npm
RUN yes | npm install

COPY ./frontend/ .

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build"]