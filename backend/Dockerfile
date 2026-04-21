# =====================================================
# Dockerfile for Backend (Node.js)
# Each line is a "layer" - Docker caches these
# =====================================================

# Step 1: Start from official Node.js image (Alpine = tiny Linux)
FROM node:18-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package files FIRST (so Docker caches dependencies)
# If you copy everything first, every code change re-installs all packages = slow
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy the rest of the app code
COPY . .

# Step 6: Tell Docker this app uses port 3001
EXPOSE 3001

# Step 7: Command to run when container starts
CMD ["node", "server.js"]
