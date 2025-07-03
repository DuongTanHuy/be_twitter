FROM  node:20-alpine3.16

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY .env.development .
COPY src ./src
# COPY ./openapi ./openapi

RUN apk add python3
RUN npm install
RUN npm run build

EXPOSE 3001

CMD ['npx', 'nodemon', 'development']
