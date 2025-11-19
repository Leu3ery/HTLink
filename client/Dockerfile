FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build production bundle
COPY . .
RUN npm run build -- --configuration production


# output only build files
FROM alpine AS export
WORKDIR /dist
COPY --from=build /app/dist/test/browser ./
CMD ["sleep", "infinity"]
