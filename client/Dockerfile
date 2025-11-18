FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build production bundle
COPY . .
RUN npm run build -- --configuration production

# Serve static files with Nginx
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist/test/browser /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]

