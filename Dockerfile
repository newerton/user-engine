FROM node:14.17.6-alpine3.14
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3002
CMD ["npm", "run", "start:dev"]
