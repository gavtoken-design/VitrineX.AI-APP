# Build Stage
FROM node:20-alpine as builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
# Using npm install instead of ci to be more lenient with lockfile issues if any
RUN npm install

# Copy source
COPY . .

# Build the app
# Note: Using 'npm run build' which triggers the vite build
RUN npm run build

# Serve Stage
FROM nginx:alpine
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Formato exigido pelo Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
