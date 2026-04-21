# Prabool's Portfolio Website

A full-stack portfolio with a Node.js backend, deployed on AWS EC2 with Nginx, containerized with Docker + Docker Compose, and automated with a GitHub Actions CI/CD pipeline.

---

## Project Structure

```
portfolio-app/
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── style.css           # All styles
│   ├── app.js              # Fetches data from backend API
│   ├── Dockerfile          # Builds frontend container (Nginx)
│   └── nginx.conf          # Nginx config for Docker
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json
│   ├── Dockerfile          # Builds backend container
│   └── data/
│       ├── projects.json   # Project data
│       ├── posts.json      # Blog post data
│       └── messages.json   # Contact form submissions
├── nginx/
│   └── portfolio.conf      # Nginx config for manual EC2 deploy
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
└── docker-compose.yml      # Run everything with one command
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Health check |
| GET | /api/projects | Get all projects |
| GET | /api/projects/:id | Get one project |
| POST | /api/projects | Add a project |
| GET | /api/posts | Get all blog posts |
| GET | /api/posts/:id | Get one post |
| POST | /api/posts | Add a post |
| POST | /api/contact | Submit contact form |

---

## PHASE 1: Run Locally

```bash
# Install backend dependencies
cd backend
npm install

# Start backend (port 3001)
npm start

# In another terminal, serve frontend
# Open frontend/index.html in browser directly
# OR install: npm install -g serve
serve frontend -p 3000
```

Test backend is working:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/posts
```

---

## PHASE 2: Deploy on EC2 + Nginx (Manual)

### Step 1: Launch EC2
- AMI: Ubuntu 22.04
- Instance type: t2.micro (free tier)
- Security group: Allow ports 22 (SSH), 80 (HTTP)

### Step 2: SSH into EC2
```bash
ssh -i your-key.pem ubuntu@YOUR-EC2-IP
```

### Step 3: Install dependencies
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (keeps Node.js running)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 4: Upload your project
```bash
# Option A: Clone from GitHub (recommended)
git clone https://github.com/YOUR_USERNAME/portfolio-app.git ~/portfolio-app

# Option B: SCP from local machine
scp -i your-key.pem -r ./portfolio-app ubuntu@YOUR-EC2-IP:~/
```

### Step 5: Start backend with PM2
```bash
cd ~/portfolio-app/backend
npm install
pm2 start server.js --name portfolio-backend
pm2 startup    # Makes PM2 restart on reboot
pm2 save
```

### Step 6: Configure Nginx
```bash
# Copy our config
sudo cp ~/portfolio-app/nginx/portfolio.conf /etc/nginx/sites-available/portfolio

# Create symlink to enable it
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Copy frontend files to where Nginx serves from
sudo mkdir -p /var/www/portfolio
sudo cp -r ~/portfolio-app/frontend /var/www/portfolio/

# Test config, then reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Test it!
```bash
curl http://YOUR-EC2-IP/health
# Visit http://YOUR-EC2-IP in browser
```

---

## PHASE 3: Docker + Docker Compose

### Install Docker on EC2
```bash
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu   # Add ubuntu user to docker group
newgrp docker                     # Apply group change
```

### Run with Docker Compose
```bash
cd ~/portfolio-app

# Build images and start all containers
docker-compose up -d

# Check containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Useful Docker commands
```bash
docker ps                          # List running containers
docker logs portfolio-backend      # View backend logs
docker exec -it portfolio-backend sh  # Shell into container
docker-compose restart backend     # Restart one service
```

---

## PHASE 4: CI/CD with GitHub Actions

### Step 1: Create GitHub repository
Push your code to GitHub.

### Step 2: Add Secrets in GitHub
Go to: GitHub Repo → Settings → Secrets and variables → Actions

Add these secrets:
| Secret | Value |
|--------|-------|
| DOCKER_USERNAME | Your Docker Hub username |
| DOCKER_PASSWORD | Your Docker Hub password/token |
| EC2_HOST | Your EC2 public IP |
| EC2_SSH_KEY | Contents of your .pem key file |

### Step 3: Push to main
Every push to `main` will:
1. Run tests
2. Build Docker images and push to Docker Hub
3. SSH into EC2 and deploy the new version

---

## Concepts You'll Learn From This Project

- **Path-based routing**: Nginx routes `/api/*` to Node.js and everything else to static files
- **Reverse proxy**: Nginx sits in front and distributes requests
- **Process management**: PM2 keeps Node.js alive
- **Containerization**: Docker packages app + dependencies
- **Service orchestration**: Docker Compose runs multiple containers
- **CI/CD**: GitHub Actions automates the entire deploy pipeline
- **Health checks**: `/health` endpoint tells load balancers if app is alive
# test
