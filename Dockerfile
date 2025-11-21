# Step 1: Use Node.js as the build environment
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production=true

# Copy the rest of the app source code
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Use Nginx to serve the production build
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the React build output to Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
