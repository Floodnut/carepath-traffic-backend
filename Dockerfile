FROM node:16-alpine3.11

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9001

CMD [ "node", "app.js" ]