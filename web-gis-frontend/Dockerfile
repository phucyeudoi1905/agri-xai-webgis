# Multi-stage Vite build + nginx for SPA
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GIS_API_URL=http://localhost:4000
ARG VITE_GIS_API_KEY=
ARG VITE_GIS_WS_URL=http://localhost:4000
ENV VITE_GIS_API_URL=$VITE_GIS_API_URL
ENV VITE_GIS_API_KEY=$VITE_GIS_API_KEY
ENV VITE_GIS_WS_URL=$VITE_GIS_WS_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
