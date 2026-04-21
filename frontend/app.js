// ===== CONFIG =====
// In production this will be proxied through Nginx
const API_BASE = '/api';

// ===== SKILLS DATA (static - no need for API) =====
const skills = [
  { name: 'Linux', icon: '🐧', level: 'Intermediate' },
  { name: 'AWS EC2', icon: '☁️', level: 'Intermediate' },
  { name: 'AWS S3', icon: '🪣', level: 'Intermediate' },
  { name: 'VPC / IAM', icon: '🔐', level: 'Intermediate' },
  { name: 'Auto Scaling', icon: '📈', level: 'Basic' },
  { name: 'Docker', icon: '🐳', level: 'Learning' },
  { name: 'Jenkins', icon: '🤖', level: 'Basic' },
  { name: 'GitHub Actions', icon: '🔄', level: 'Learning' },
  { name: 'Nginx', icon: '⚡', level: 'Intermediate' },
  { name: 'Prometheus', icon: '📊', level: 'Basic' },
  { name: 'Grafana', icon: '📉', level: 'Basic' },
  { name: 'Python', icon: '🐍', level: 'Intermediate' },
  { name: 'Git', icon: '📦', level: 'Intermediate' },
  { name: 'Kubernetes', icon: '🎡', level: 'Soon...' },
];

// ===== RENDER SKILLS =====
function renderSkills() {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = skills.map(s => `
    <div class="skill-card fade-up">
      <div class="skill-icon">${s.icon}</div>
      <div class="skill-name">${s.name}</div>
      <div class="skill-level">${s.level}</div>
    </div>
  `).join('');
}

// ===== FETCH & RENDER PROJECTS =====
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch(`${API_BASE}/projects`);
    const projects = await res.json();

    if (!projects.length) {
      grid.innerHTML = '<div class="loading-state">No projects yet. Check back soon!</div>';
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="project-card fade-up">
        <div class="project-tag">${p.tag || 'PROJECT'}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.description}</div>
        <div class="project-stack">
          ${p.stack.map(t => `<span>${t}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank">GitHub ↗</a>` : ''}
          ${p.live ? `<a href="${p.live}" target="_blank">Live ↗</a>` : ''}
        </div>
      </div>
    `).join('');

    // Update hero stat
    document.getElementById('stat-projects').textContent = projects.length;
  } catch (err) {
    grid.innerHTML = '<div class="loading-state">Could not load projects.</div>';
    console.error('Projects fetch error:', err);
  }
}

// ===== FETCH & RENDER BLOG POSTS =====
async function loadBlogPosts() {
  const grid = document.getElementById('blog-grid');
  try {
    const res = await fetch(`${API_BASE}/posts`);
    const posts = await res.json();

    if (!posts.length) {
      grid.innerHTML = '<div class="loading-state">No posts yet. First post coming soon!</div>';
      return;
    }

    grid.innerHTML = posts.map(p => `
      <div class="blog-card fade-up" onclick="openPost('${p.id}')">
        <div>
          <div class="blog-meta">${formatDate(p.date)} · ${p.readTime || '5 min read'}</div>
          <div class="blog-title">${p.title}</div>
          <div class="blog-excerpt">${p.excerpt}</div>
        </div>
        <div class="blog-arrow">→</div>
      </div>
    `).join('');

    document.getElementById('stat-posts').textContent = posts.length;
  } catch (err) {
    grid.innerHTML = '<div class="loading-state">Could not load posts.</div>';
    console.error('Blog fetch error:', err);
  }
}

// ===== SEND MESSAGE =====
async function sendMessage() {
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const message = document.getElementById('c-msg').value.trim();
  const status = document.getElementById('form-status');
  const btn = document.getElementById('send-btn');

  if (!name || !email || !message) {
    status.textContent = 'Please fill in all fields.';
    status.className = 'form-status error';
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();

    if (res.ok) {
      status.textContent = '✓ Message sent! I\'ll get back to you soon.';
      status.className = 'form-status success';
      document.getElementById('c-name').value = '';
      document.getElementById('c-email').value = '';
      document.getElementById('c-msg').value = '';
    } else {
      throw new Error(data.error || 'Something went wrong');
    }
  } catch (err) {
    status.textContent = '✗ Failed to send. Try again.';
    status.className = 'form-status error';
  } finally {
    btn.textContent = 'Send Message';
    btn.disabled = false;
  }
}

// ===== OPEN BLOG POST =====
function openPost(id) {
  // In a real app this would route to /blog/:id
  // For now we'll just alert - you can build post pages later
  alert(`Blog post ${id} - full post page coming soon!`);
}

// ===== HELPERS =====
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

// ===== COUNTER ANIMATION =====
function animateCounter(el, target) {
  let count = 0;
  const step = Math.ceil(target / 20);
  const timer = setInterval(() => {
    count += step;
    if (count >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = count;
  }, 60);
}

// ===== NAV ACTIVE STATE =====
function setupNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderSkills();
  loadProjects();
  loadBlogPosts();
  setupNav();
});
