// ===========================================================================
// Mahmoud Hisham Almodalal — Cinematic Portfolio Engine
// ===========================================================================

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------------------------------------------------------------------------
// 1. Navigation & Hamburger Menu
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

// Nav backdrop elevation on scroll
const nav = document.querySelector('nav');
let navTick = false;
function syncNav() {
  navTick = false;
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 32);
}
window.addEventListener('scroll', () => {
  if (!navTick) {
    navTick = true;
    requestAnimationFrame(syncNav);
  }
}, { passive: true });
syncNav();

// Active nav section tracker
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (trackedSections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const current = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!current) return;

    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${current.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-22% 0px -65% 0px',
    threshold: [0.05, 0.2],
  });

  trackedSections.forEach((sec) => sectionObserver.observe(sec));
}

// ---------------------------------------------------------------------------
// 2. Cinematic Entrance Preloader (Dual Curtain Split)
// ---------------------------------------------------------------------------
const preloader = document.getElementById('page-preloader');
const preloaderBar = document.querySelector('.preloader-bar');

function launchEntrance() {
  if (!preloader) return;

  // Progress animation
  if (preloaderBar) {
    preloaderBar.style.width = '100%';
  }

  setTimeout(() => {
    preloader.classList.add('fade-out');

    // Trigger hero lines masked reveal
    setTimeout(() => {
      document.querySelectorAll('.hero-line').forEach((line, index) => {
        line.style.transitionDelay = `${index * 120}ms`;
        line.style.transform = 'translateY(0)';
      });
      // Remove preloader from accessibility tree after curtains part
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    }, 280);
  }, 750);
}

if (document.readyState === 'complete') {
  setTimeout(launchEntrance, 150);
} else {
  window.addEventListener('load', () => setTimeout(launchEntrance, 150));
  // Fallback safety trigger (max 1.6s)
  setTimeout(launchEntrance, 1600);
}

// ---------------------------------------------------------------------------
// 3. Scroll Progress Bar & Floating Back-To-Top Button
// ---------------------------------------------------------------------------
const progressBar = document.getElementById('scroll-progress-bar');
const backToTopBtn = document.getElementById('back-to-top');

function handleScrollInteractions() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (progressBar && docHeight > 0) {
    const progressPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progressBar.style.width = `${progressPercent}%`;
  }

  if (backToTopBtn) {
    if (scrollTop > 450) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
}

window.addEventListener('scroll', handleScrollInteractions, { passive: true });
handleScrollInteractions();

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  });
}

// ---------------------------------------------------------------------------
// 4. Interactive Architecture Signature Canvas (Backend & AI Signal)
// ---------------------------------------------------------------------------
const archCanvas = document.getElementById('architecture-canvas');
if (archCanvas && !reducedMotion.matches) {
  const ctx = archCanvas.getContext('2d');
  let animationFrameId;

  // Resize canvas to match display pixel ratio
  const dpr = window.devicePixelRatio || 1;
  const width = archCanvas.clientWidth || 680;
  const height = archCanvas.clientHeight || 95;
  archCanvas.width = width * dpr;
  archCanvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Architecture Nodes: Database, Queue, Worker, Cache, Model Engine
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

  // Moving signal pulses along links
  const pulses = links.map(([fromIdx, toIdx], i) => ({
    from: nodes[fromIdx],
    to: nodes[toIdx],
    progress: (i * 0.18) % 1,
    speed: 0.006 + Math.random() * 0.006,
  }));

  function drawArchitectureMatrix() {
    ctx.clearRect(0, 0, width, height);

    // Draw links
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(215, 207, 196, 0.7)';
    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });

    // Animate & draw data pulses
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

    // Draw node circles & monospaced labels
    nodes.forEach((node) => {
      // Glow ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(185, 74, 31, 0.15)';
      ctx.stroke();

      // Node point
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Monospace label
      ctx.fillStyle = 'rgba(95, 81, 72, 0.85)';
      ctx.font = '500 7.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + (node.y > height * 0.5 ? 14 : -10));
    });

    animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
  }

  drawArchitectureMatrix();

  // Cleanup if page unloads
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
  });
}

// ---------------------------------------------------------------------------
// 5. Desktop 3D Tilt Micro-Interaction for Case Studies
// ---------------------------------------------------------------------------
if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
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

      // Subtle clamp: max 4.5 degrees
      const rotX = -yPct * 4.5;
      const rotY = xPct * 4.5;

      tiltTarget.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      tiltTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ---------------------------------------------------------------------------
// 6. Project Filters with Smooth Transition
// ---------------------------------------------------------------------------
document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    document.querySelectorAll('.project-card').forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        card.removeAttribute('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.setAttribute('hidden', '');
      }
    });
  });
});

// Card click delegates to primary link without overriding nested links
document.querySelectorAll('.project-card').forEach((card) => {
  const primaryLink = card.querySelector('.project-link');
  if (!primaryLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    window.open(primaryLink.href, '_blank', 'noopener');
  });
});

// ---------------------------------------------------------------------------
// 7. Desktop Precision Cursor & Magnetic Interactions
// ---------------------------------------------------------------------------
const customCursor = document.getElementById('custom-cursor');
if (customCursor && !reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Smooth lerp loop for outer ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.22;
    ringY += (mouseY - ringY) * 0.22;

    customCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    const ring = customCursor.querySelector('.cursor-ring');
    if (ring) {
      ring.style.transform = `translate3d(${ringX - mouseX}px, ${ringY - mouseY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover states on clickable targets
  const interactiveElements = document.querySelectorAll('a, button, .project-card, .magnet-target');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Magnetic Button Effect on .magnet-target
  document.querySelectorAll('.magnet-target').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Controlled pull: max 5px
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// ---------------------------------------------------------------------------
// 8. Viewport Scroll Reveals (GSAP ScrollTrigger or IntersectionObserver Fallback)
// ---------------------------------------------------------------------------
if (!reducedMotion.matches) {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Fade-in sections with stagger
    document.querySelectorAll('.featured-project').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 35,
        duration: 0.75,
        ease: 'power2.out',
      });
    });

    // Headings
    document.querySelectorAll('.section-heading, .projects-heading, .contact-inner').forEach((heading) => {
      gsap.from(heading, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    // Timeline items staggered
    gsap.utils.toArray('.tl-item').forEach((item) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        x: -16,
        duration: 0.55,
        ease: 'power2.out',
      });
    });

    // Expertise rows staggered
    gsap.utils.toArray('.expertise-row').forEach((row) => {
      gsap.from(row, {
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: 'power1.out',
      });
    });

  } else if ('IntersectionObserver' in window) {
    // Pure vanilla IntersectionObserver fallback
    document.documentElement.classList.add('motion-ready');

    const targets = [
      ...document.querySelectorAll('.fade-in'),
      ...document.querySelectorAll('.section-heading, .additional-projects-head'),
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -4% 0px',
    });

    targets.forEach((el) => observer.observe(el));
  }
}
