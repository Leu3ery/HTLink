# ---------- BUILD ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps
    
    COPY . .
    RUN npm run build
    
    # ---------- RUNTIME (NGINX) ----------
    FROM nginx:1.27-alpine
    
    # Remove default config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy custom nginx config
    COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf
    
    # Copy built frontend
    COPY --from=build /app/dist/*/browser /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    
