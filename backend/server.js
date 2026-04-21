const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Request logger (great for DevOps - you'll see every request in logs)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===== HELPERS =====
// Read a JSON file from /data folder
function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// Write data back to JSON file
function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===== HEALTH CHECK =====
// This is very important in DevOps - used by load balancers to check if app is alive
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'portfolio-backend'
  });
});

// ===== PROJECTS ROUTES =====

// GET /api/projects - Get all projects
app.get('/api/projects', (req, res) => {
  const projects = readData('projects.json');
  res.json(projects);
});

// GET /api/projects/:id - Get single project
app.get('/api/projects/:id', (req, res) => {
  const projects = readData('projects.json');
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// POST /api/projects - Add a new project (admin use)
app.post('/api/projects', (req, res) => {
  const { title, description, stack, github, live, tag } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const projects = readData('projects.json');
  const newProject = {
    id: `proj-${Date.now()}`,
    title,
    description,
    stack: stack || [],
    github: github || '',
    live: live || '',
    tag: tag || 'PROJECT',
    createdAt: new Date().toISOString()
  };

  projects.push(newProject);
  writeData('projects.json', projects);
  res.status(201).json(newProject);
});

// ===== BLOG ROUTES =====

// GET /api/posts - Get all blog posts
app.get('/api/posts', (req, res) => {
  const posts = readData('posts.json');
  // Sort by date, newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(posts);
});

// GET /api/posts/:id - Get single blog post
app.get('/api/posts/:id', (req, res) => {
  const posts = readData('posts.json');
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// POST /api/posts - Create new blog post
app.post('/api/posts', (req, res) => {
  const { title, excerpt, content, readTime } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const posts = readData('posts.json');
  const newPost = {
    id: `post-${Date.now()}`,
    title,
    excerpt: excerpt || content.substring(0, 120) + '...',
    content,
    readTime: readTime || '5 min read',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  writeData('posts.json', posts);
  res.status(201).json(newPost);
});

// ===== CONTACT ROUTE =====

// POST /api/contact - Save a contact message
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const messages = readData('messages.json');
  const newMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    message,
    receivedAt: new Date().toISOString(),
    read: false
  };

  messages.push(newMessage);
  writeData('messages.json', messages);

  console.log(`📬 New message from ${name} (${email})`);
  res.json({ success: true, message: 'Message received!' });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
