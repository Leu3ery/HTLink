FROM node:20

# ENV PORT=8000
# ENV JWT_SECRET=secret
# ENV MONGO_URI=mongodb://localhost
# ENV PASSWORD_SALT=5

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npx tsc

CMD [ "node", "dist/server.js" ]