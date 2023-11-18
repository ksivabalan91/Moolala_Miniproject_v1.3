# Stage 1: Build the Angular application
FROM node:latest as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json /app/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the Angular project to the container
COPY . /app

# Build the project
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built app from the previous stage
COPY --from=build /app/dist/client /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx and serve the application
CMD ["nginx", "-g", "daemon off;"]