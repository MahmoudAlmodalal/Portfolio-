// ===========================================================================
// js/main.js — Core Functionality & Interactive Signals
// Mahmoud Hisham Almodalal Portfolio
// ===========================================================================

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------------------------------------------------------------------------
// 1. Mobile Menu Controls
// ---------------------------------------------------------------------------
function closeMenu() {
  const button = document.querySelector('.hamburger');
  const menu = document.querySelector('nav ul');
  if (!button || !menu) return;
  button.classList.remove('active');
  menu.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
}
window.closeMenu = closeMenu;

const menuButton = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');

if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    const open = !navMenu.classList.contains('open');
    menuButton.classList.toggle('active', open);
    navMenu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

// ---------------------------------------------------------------------------
// 2. Navigation Scroll Elevation & Back-To-Top Interaction
// ---------------------------------------------------------------------------
const nav = document.querySelector('nav');
const progressBar = document.getElementById('scroll-progress-bar');
const backToTopBtn = document.getElementById('back-to-top');

let scrollTick = false;
function onWindowScroll() {
  scrollTick = false;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  // Nav class
  if (nav) nav.classList.toggle('scrolled', scrollTop > 32);

  // Scroll Progress Bar
  if (progressBar && docHeight > 0) {
    const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progressBar.style.width = `${pct}%`;
  }

  // Floating Back to Top Button
  if (backToTopBtn) {
    if (scrollTop > 450) backToTopBtn.classList.add('visible');
    else backToTopBtn.classList.remove('visible');
  }
}

window.addEventListener('scroll', () => {
  if (!scrollTick) {
    scrollTick = true;
    requestAnimationFrame(onWindowScroll);
  }
}, { passive: true });
onWindowScroll();

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  });
}

// ---------------------------------------------------------------------------
// 3. Card Click Delegation (Primary Link)
// ---------------------------------------------------------------------------
document.querySelectorAll('.project-card').forEach((card) => {
  const primaryLink = card.querySelector('.project-link');
  if (!primaryLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    window.open(primaryLink.href, '_blank', 'noopener');
  });
});

// ---------------------------------------------------------------------------
// 4. Interactive Architecture Signature Canvas (Backend & AI Signal)
// ---------------------------------------------------------------------------
const archCanvas = document.getElementById('architecture-canvas');
if (archCanvas && !reducedMotion.matches) {
  const ctx = archCanvas.getContext('2d');
  let animationFrameId;

  const dpr = window.devicePixelRatio || 1;
  const width = archCanvas.clientWidth || 680;
  const height = archCanvas.clientHeight || 95;
  archCanvas.width = width * dpr;
  archCanvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const nodes = [
    { label: 'CLIENT/API', x: width * 0.08, y: height * 0.5, color: '#b94a1f', radius: 4 },
    { label: 'FASTAPI GATEWAY', x: width * 0.30, y: height * 0.35, color: '#5f5148', radius: 5 },
    { label: 'REDIS QUEUE', x: width * 0.52, y: height * 0.25, color: '#b94a1f', radius: 4 },
    { label: 'CELERY WORKERS', x: width * 0.74, y: height * 0.32, color: '#607768', radius: 4.5 },
    { label: 'POSTGRES / DB', x: width * 0.38, y: height * 0.75, color: '#5f5148', radius: 5 },
    { label: 'CHROMADB / RAG', x: width * 0.70, y: height * 0.75, color: '#b94a1f', radius: 5.5 },
    { label: 'LLM INFERENCE', x: width * 0.92, y: height * 0.5, color: '#607768', radius: 4 },
  ];

  const links = [
    [0, 1], [1, 2], [2, 3], [1, 4], [3, 4], [1, 5], [5, 6], [3, 6]
  ];

  const pulses = links.map(([fromIdx, toIdx], i) => ({
    from: nodes[fromIdx],
    to: nodes[toIdx],
    progress: (i * 0.18) % 1,
    speed: 0.006 + Math.random() * 0.006,
  }));

  function drawArchitectureMatrix() {
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(215, 207, 196, 0.7)';
    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    pulses.forEach((p) => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const px = p.from.x + (p.to.x - p.from.x) * p.progress;
      const py = p.from.y + (p.to.y - p.from.y) * p.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b94a1f';
      ctx.shadowColor = 'rgba(185, 74, 31, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(185, 74, 31, 0.15)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      ctx.fillStyle = 'rgba(95, 81, 72, 0.85)';
      ctx.font = '500 7.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + (node.y > height * 0.5 ? 14 : -10));
    });

    animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
  }

  drawArchitectureMatrix();

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
  });
}

// ---------------------------------------------------------------------------
// 5. Desktop 3D Tilt Micro-Interaction for Featured Case Studies
// ---------------------------------------------------------------------------
if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 768) {
  const tiltCards = document.querySelectorAll('[data-tilt="true"]');
  tiltCards.forEach((card) => {
    const tiltTarget = card.querySelector('.tilt-box');
    if (!tiltTarget) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;

      // Restrained clamp (max 3.5 degrees)
      const rotX = -yPct * 3.5;
      const rotY = xPct * 3.5;

      tiltTarget.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      tiltTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}
