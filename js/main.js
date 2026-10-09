// ===========================================================================
// js/main.js — Core Functionality, UI Interactions & Architecture Canvas
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

  document.addEventListener('click', (event) => {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
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

  // Header elevation
  if (nav) nav.classList.toggle('scrolled', scrollTop > 24);

  // Scroll Progress Bar
  if (progressBar && docHeight > 0) {
    const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progressBar.style.width = `${pct}%`;
  }

  // Floating Back to Top Button
  if (backToTopBtn) {
    if (scrollTop > 400) backToTopBtn.classList.add('visible');
    else backToTopBtn.classList.remove('visible');
  }
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(onWindowScroll);
    }
  },
  { passive: true }
);
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
// 4. Interactive Architecture Signature Canvas (Live Cluster Visualization)
// ---------------------------------------------------------------------------
const archCanvas = document.getElementById('architecture-canvas');
if (archCanvas && !reducedMotion.matches) {
  const ctx = archCanvas.getContext('2d');
  let animationFrameId;
  let width = 680;
  let height = 95;
  let dashOffset = 0;
  let startTime = performance.now();

  const nodeRatios = [
    { label: 'CLIENT/API', rx: 0.08, ry: 0.50, color: '#b94a1f', radius: 4 },
    { label: 'FASTAPI GATEWAY', rx: 0.30, ry: 0.35, color: '#5f5148', radius: 5 },
    { label: 'REDIS QUEUE', rx: 0.52, ry: 0.25, color: '#b94a1f', radius: 4 },
    { label: 'CELERY WORKERS', rx: 0.74, ry: 0.32, color: '#607768', radius: 4.5 },
    { label: 'POSTGRES / DB', rx: 0.38, ry: 0.75, color: '#5f5148', radius: 5 },
    { label: 'CHROMADB / RAG', rx: 0.70, ry: 0.75, color: '#b94a1f', radius: 5.5 },
    { label: 'LLM INFERENCE', rx: 0.92, ry: 0.50, color: '#607768', radius: 4 },
  ];

  const links = [
    [0, 1], [1, 2], [2, 3], [1, 4], [3, 4], [1, 5], [5, 6], [3, 6]
  ];

  let nodes = [];
  let pulses = [];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = archCanvas.parentElement ? archCanvas.parentElement.clientWidth : (archCanvas.clientWidth || 680);
    height = 95;
    archCanvas.width = width * dpr;
    archCanvas.height = height * dpr;
    if (ctx.resetTransform) ctx.resetTransform();
    else ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    nodes = nodeRatios.map((n) => ({
      ...n,
      x: width * n.rx,
      y: height * n.ry,
    }));

    pulses = links.map(([fromIdx, toIdx], i) => ({
      fromIdx,
      toIdx,
      progress: (i * 0.18) % 1,
      speed: 0.005 + (i % 3) * 0.002,
    }));
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function drawArchitectureMatrix(now) {
    const elapsed = (now - startTime) / 1000;
    dashOffset = (elapsed * 18) % 16;

    ctx.clearRect(0, 0, width, height);

    // 1. Base network topology lines (static faint background)
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(215, 207, 196, 0.45)';
    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    // 2. Animated dashed connection stream lines (dash offset flowing forward)
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -dashOffset;
    ctx.strokeStyle = 'rgba(185, 74, 31, 0.42)';
    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Traveling packets with glow
    pulses.forEach((p) => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const nFrom = nodes[p.fromIdx];
      const nTo = nodes[p.toIdx];
      const px = nFrom.x + (nTo.x - nFrom.x) * p.progress;
      const py = nFrom.y + (nTo.y - nFrom.y) * p.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b94a1f';
      ctx.shadowColor = 'rgba(185, 74, 31, 0.65)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 4. Cluster nodes with pulsing aura
    nodes.forEach((node, i) => {
      const pulse = Math.sin(elapsed * 2.4 + i * 1.1) * 0.5 + 0.5;
      const auraRadius = node.radius + 2 + pulse * 3.5;

      // Pulsing outer halo
      ctx.beginPath();
      ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(185, 74, 31, ${0.12 + pulse * 0.28})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Node core
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Label text
      ctx.fillStyle = 'rgba(95, 81, 72, 0.88)';
      ctx.font = '500 7.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      const labelY = node.y + (node.y > height * 0.5 ? 13 : -10);
      ctx.fillText(node.label, node.x, labelY);
    });

    animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
  }

  animationFrameId = requestAnimationFrame(drawArchitectureMatrix);

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
    const tiltTarget = card.querySelector('.project-card-img');
    if (!tiltTarget) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;

      // Restrained clamp (max 3 degrees)
      const rotX = -yPct * 3;
      const rotY = xPct * 3;

      tiltTarget.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      tiltTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ---------------------------------------------------------------------------
// 6. Project Filter Controls & Tabs (Robust Vanilla Implementation)
// ---------------------------------------------------------------------------
const filterBar = document.querySelector('.filter-bar');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterIndicator = document.querySelector('.filter-indicator');
const projectCards = document.querySelectorAll('.project-card');

function updateFilterIndicator(btn) {
  if (!btn || !filterIndicator) return;
  filterIndicator.style.transform = `translateX(${btn.offsetLeft}px)`;
  filterIndicator.style.width = `${btn.offsetWidth}px`;
}

if (filterBar && filterButtons.length && projectCards.length) {
  const initialActive = filterBar.querySelector('.filter-btn.active') || filterButtons[0];
  if (initialActive) {
    requestAnimationFrame(() => updateFilterIndicator(initialActive));
  }

  window.addEventListener('resize', () => {
    const currentActive = filterBar.querySelector('.filter-btn.active');
    if (currentActive) updateFilterIndicator(currentActive);
  }, { passive: true });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;

      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      updateFilterIndicator(btn);

      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (reducedMotion.matches) {
          card.style.display = matches ? '' : 'none';
          card.style.opacity = matches ? '1' : '0';
          card.style.transform = 'none';
        } else {
          if (matches) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            card.style.transition = 'none';

            requestAnimationFrame(() => {
              card.style.transition = 'opacity 280ms var(--ease), transform 280ms var(--ease)';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.transition = 'opacity 180ms var(--ease), transform 180ms var(--ease)';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.97)';
            setTimeout(() => {
              if (btn.dataset.filter !== 'all' && card.dataset.category !== btn.dataset.filter) {
                card.style.display = 'none';
              }
            }, 180);
          }
        }
      });
    });
  });
}

