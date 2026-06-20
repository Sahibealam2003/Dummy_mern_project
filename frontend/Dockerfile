# Step 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci

# Copy the entire project source code
COPY . .

# Build the production application bundle
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove the default Nginx index.html and server config
RUN rm -rf ./*
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build assets from the builder stage
COPY --from=builder /app/dist .

# Expose port 80 to client requests
EXPOSE 80

# Launch Nginx server in background
CMD ["nginx", "-g", "daemon off;"]
