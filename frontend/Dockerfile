# =====================================================
# Dockerfile for Frontend (static files served by Nginx)
# =====================================================

# Start from official Nginx image
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy our frontend files into nginx's serving directory
COPY . /usr/share/nginx/html

# Copy our custom nginx config (handles /api proxying)
# Note: in docker-compose, the API proxy points to 'backend' service
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx starts automatically - no CMD needed (it's in the base image)
