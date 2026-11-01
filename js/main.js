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
// 3. Interactive Visual Lightbox Controller ("الصور تفتح عدل")
// ---------------------------------------------------------------------------
const lightbox = document.getElementById('project-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxKicker = document.getElementById('lightbox-kicker');
const lightboxLink = document.getElementById('lightbox-link');
const lightboxNav = document.getElementById('lightbox-gallery-nav');
const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
const lightboxNextBtn = document.getElementById('lightbox-next-btn');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxViewLabel = document.getElementById('lightbox-view-label');

let currentGallery = [];
let currentGalleryIndex = 0;
let lastActiveElement = null;

function updateLightboxImage() {
  if (!currentGallery.length || !lightboxImg) return;
  const currentItem = currentGallery[currentGalleryIndex];
  lightboxImg.style.opacity = '0';
  lightboxImg.style.transform = 'scale(0.98)';

  const tempImg = new Image();
  tempImg.onload = () => {
    lightboxImg.src = currentItem.src;
    lightboxImg.alt = currentItem.alt || (lightboxTitle ? lightboxTitle.textContent : 'Project visual');
    lightboxImg.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
  };
  tempImg.src = currentItem.src;

  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`;
  }
  if (lightboxViewLabel) {
    lightboxViewLabel.textContent = currentItem.label || (currentGallery.length > 1 ? `View ${currentGalleryIndex + 1} of ${currentGallery.length}` : 'Production preview');
  }
}

function openLightbox(gallery, initialIndex = 0, meta = {}) {
  if (!lightbox) return;
  lastActiveElement = document.activeElement;
  currentGallery = gallery;
  currentGalleryIndex = initialIndex;

  if (lightboxTitle) lightboxTitle.textContent = meta.title || '';
  if (lightboxKicker) lightboxKicker.textContent = meta.kicker || 'PROJECT PREVIEW';
  if (lightboxLink) {
    if (meta.link) {
      lightboxLink.href = meta.link;
      lightboxLink.style.display = 'inline-flex';
    } else {
      lightboxLink.style.display = 'none';
    }
  }

  if (lightboxNav) {
    lightboxNav.hidden = currentGallery.length <= 1;
  }

  updateLightboxImage();

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');

  const closeBtn = lightbox.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
}

function closeLightbox() {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
    lastActiveElement.focus();
  }
}

if (lightbox) {
  lightbox.querySelectorAll('[data-close="lightbox"]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      if (currentGallery.length <= 1) return;
      currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightboxImage();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      if (currentGallery.length <= 1) return;
      currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
      updateLightboxImage();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      if (lightboxPrevBtn && currentGallery.length > 1) lightboxPrevBtn.click();
    }
    if (e.key === 'ArrowRight') {
      if (lightboxNextBtn && currentGallery.length > 1) lightboxNextBtn.click();
    }
  });

  // Attach Lightbox triggers to all project card visual containers
  document.querySelectorAll('.project-card').forEach((card) => {
    const cardImgAnchor = card.querySelector('.project-card-img');
    if (!cardImgAnchor) return;

    cardImgAnchor.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();

      const imgEl = cardImgAnchor.querySelector('img');
      const titleEl = card.querySelector('.project-title');
      const kickerEl = card.querySelector('.project-kicker') || card.querySelector('.project-kicker-row');
      const primaryLink = card.querySelector('.project-link');

      let customImages = [];
      if (cardImgAnchor.dataset.images) {
        customImages = cardImgAnchor.dataset.images.split(',').map((s) => s.trim());
      } else if (imgEl && imgEl.src) {
        customImages = [imgEl.src];
      }

      const gallery = customImages.map((src, i) => ({
        src,
        alt: `${titleEl ? titleEl.textContent.trim() : 'Project'} preview ${i + 1}`,
        label: i === 0 && customImages.length > 1 ? 'Live Platform Overview' : (i === 1 && customImages.length > 1 ? 'Partner Dashboard & Operations' : 'Interface Inspection'),
      }));

      openLightbox(gallery, 0, {
        title: cardImgAnchor.dataset.title || (titleEl ? titleEl.textContent.trim() : ''),
        kicker: cardImgAnchor.dataset.kicker || (kickerEl ? kickerEl.textContent.trim() : 'CASE STUDY PREVIEW'),
        link: cardImgAnchor.dataset.link || (primaryLink ? primaryLink.href : ''),
      });
    });
  });
}

// 3.1 Card Click Delegation (Primary Link on Background Area)
document.querySelectorAll('.project-card').forEach((card) => {
  const primaryLink = card.querySelector('.project-link');
  if (!primaryLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, .project-card-img')) return;
    window.open(primaryLink.href, '_blank', 'noopener');
  });
});

// ---------------------------------------------------------------------------
// 4. Interactive Architecture Signature Canvas (Live Cluster Visualization)
// ---------------------------------------------------------------------------
const archCanvas = document.getElementById('architecture-canvas');
if (archCanvas && !reducedMotion.matches) {
  const ctx = archCanvas.getContext('2d');
  let animationFrameId = null;
  let width = 680;
  let height = 110;
  let dashOffset = 0;
  let startTime = performance.now();
  let isCanvasVisible = true;
  let currentFlow = 'backend'; // 'backend' | 'async' | 'ai'

  // 7 Architecture Nodes
  const nodeDefinitions = [
    { id: 0, label: 'CLIENT/API', color: '#b94a1f', radius: 4 },
    { id: 1, label: 'FASTAPI GATEWAY', color: '#5f5148', radius: 5 },
    { id: 2, label: 'REDIS QUEUE', color: '#b94a1f', radius: 4 },
    { id: 3, label: 'CELERY WORKERS', color: '#607768', radius: 4.5 },
    { id: 4, label: 'POSTGRES / DB', color: '#5f5148', radius: 5 },
    { id: 5, label: 'CHROMADB / RAG', color: '#b94a1f', radius: 5.5 },
    { id: 6, label: 'LLM INFERENCE', color: '#607768', radius: 4 },
  ];

  // Base network links between nodes
  const links = [
    [0, 1], [1, 2], [2, 3], [1, 4], [3, 4], [1, 5], [5, 6], [3, 6]
  ];

  // Flow specific active configurations
  const flowConfigs = {
    backend: {
      activeNodes: [0, 1, 4],
      activeLinks: [[0, 1], [1, 4]],
      status: 'FASTAPI + POSTGRES // 60 FPS'
    },
    async: {
      activeNodes: [1, 2, 3, 4],
      activeLinks: [[1, 2], [2, 3], [3, 4]],
      status: 'REDIS + CELERY WORKERS // 60 FPS'
    },
    ai: {
      activeNodes: [1, 3, 5, 6],
      activeLinks: [[1, 5], [5, 6], [3, 6]],
      status: 'RAG + LLM PIPELINE // 60 FPS'
    }
  };

  let nodes = [];
  let pulses = [];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = archCanvas.parentElement ? archCanvas.parentElement.clientWidth : 680;
    const isMobileLayout = width < 640;
    height = archCanvas.parentElement ? archCanvas.parentElement.clientHeight : (isMobileLayout ? 210 : 110);
    
    archCanvas.width = width * dpr;
    archCanvas.height = height * dpr;
    if (ctx.resetTransform) ctx.resetTransform();
    else ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const fontSize = isMobileLayout ? 7 : 7.5;
    ctx.font = `500 ${fontSize}px "IBM Plex Mono", monospace`;

    // Responsive node layout
    nodes = nodeDefinitions.map((def, idx) => {
      let targetX, targetY;
      if (isMobileLayout) {
        // Mobile 3-Tier topology (210px height gives ~70px per tier):
        if (idx === 0) { targetX = width * 0.22; targetY = height * 0.20; }
        else if (idx === 1) { targetX = width * 0.72; targetY = height * 0.20; }
        else if (idx === 2) { targetX = width * 0.24; targetY = height * 0.48; }
        else if (idx === 3) { targetX = width * 0.76; targetY = height * 0.48; }
        else if (idx === 4) { targetX = width * 0.18; targetY = height * 0.80; }
        else if (idx === 5) { targetX = width * 0.52; targetY = height * 0.80; }
        else if (idx === 6) { targetX = width * 0.82; targetY = height * 0.80; }
      } else {
        // Desktop horizontal flow
        const ratios = [
          { rx: 0.08, ry: 0.50 }, // 0: CLIENT/API
          { rx: 0.30, ry: 0.35 }, // 1: FASTAPI
          { rx: 0.52, ry: 0.25 }, // 2: REDIS
          { rx: 0.74, ry: 0.32 }, // 3: CELERY
          { rx: 0.38, ry: 0.75 }, // 4: POSTGRES
          { rx: 0.70, ry: 0.75 }, // 5: CHROMADB
          { rx: 0.92, ry: 0.50 }, // 6: LLM
        ];
        targetX = width * ratios[idx].rx;
        targetY = height * ratios[idx].ry;
      }

      // Safe horizontal coordinate clamping so text labels NEVER truncate
      const textMetrics = ctx.measureText(def.label);
      const halfWidth = textMetrics.width / 2 + 6;
      const clampedX = Math.max(halfWidth, Math.min(width - halfWidth, targetX));

      return {
        ...def,
        x: clampedX,
        y: targetY,
        fontSize,
      };
    });

    // Generate traveling packet pulses
    pulses = links.map(([fromIdx, toIdx], i) => ({
      fromIdx,
      toIdx,
      progress: (i * 0.18) % 1,
      speed: 0.005 + (i % 3) * 0.002,
    }));
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Tab interactive controls
  const pipelineTabs = document.querySelectorAll('.pipeline-tab');
  const signalStatusEl = document.querySelector('.signal-status');

  pipelineTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const flow = tab.dataset.flow;
      if (!flow || flow === currentFlow) return;

      currentFlow = flow;
      pipelineTabs.forEach(t => {
        const isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });

      if (signalStatusEl && flowConfigs[currentFlow]) {
        signalStatusEl.textContent = flowConfigs[currentFlow].status;
      }
    });
  });

  function drawArchitectureMatrix(now) {
    if (!isCanvasVisible) return;

    const elapsed = (now - startTime) / 1000;
    dashOffset = (elapsed * 18) % 16;

    ctx.clearRect(0, 0, width, height);

    const activeConfig = flowConfigs[currentFlow] || flowConfigs.backend;
    const isMobile = width < 640;

    // Helper to draw link with curved path on mobile for link [1, 4]
    function traceLink(a, b) {
      ctx.moveTo(nodes[a].x, nodes[a].y);
      if (isMobile && ((a === 1 && b === 4) || (a === 4 && b === 1))) {
        ctx.quadraticCurveTo(width * 0.58, height * 0.55, nodes[b].x, nodes[b].y);
      } else {
        ctx.lineTo(nodes[b].x, nodes[b].y);
      }
    }

    // 1. Inactive background links
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(215, 207, 196, 0.35)';
    links.forEach(([a, b]) => {
      ctx.beginPath();
      traceLink(a, b);
      ctx.stroke();
    });

    // 2. Active highlighted flow links (flowing dashes)
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -dashOffset;
    ctx.strokeStyle = 'rgba(200, 90, 50, 0.75)';
    activeConfig.activeLinks.forEach(([a, b]) => {
      ctx.beginPath();
      traceLink(a, b);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Traveling packets with glow along active flow
    pulses.forEach((p) => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const isLinkActive = activeConfig.activeLinks.some(([a, b]) => 
        (p.fromIdx === a && p.toIdx === b) || (p.fromIdx === b && p.toIdx === a)
      );

      const nFrom = nodes[p.fromIdx];
      const nTo = nodes[p.toIdx];
      let px, py;
      const isCurved14 = isMobile && (
        (p.fromIdx === 1 && p.toIdx === 4) || (p.fromIdx === 4 && p.toIdx === 1)
      );

      if (isCurved14) {
        const cpx = width * 0.58;
        const cpy = height * 0.55;
        const t = p.progress;
        const invT = 1 - t;
        px = invT * invT * nFrom.x + 2 * invT * t * cpx + t * t * nTo.x;
        py = invT * invT * nFrom.y + 2 * invT * t * cpy + t * t * nTo.y;
      } else {
        px = nFrom.x + (nTo.x - nFrom.x) * p.progress;
        py = nFrom.y + (nTo.y - nFrom.y) * p.progress;
      }

      ctx.beginPath();
      ctx.arc(px, py, isLinkActive ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = isLinkActive ? '#C85A32' : 'rgba(185, 74, 31, 0.25)';
      if (isLinkActive) {
        ctx.shadowColor = 'rgba(200, 90, 50, 0.7)';
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 4. Cluster nodes with pulsing aura
    nodes.forEach((node, i) => {
      const isActiveNode = activeConfig.activeNodes.includes(node.id);
      const pulse = Math.sin(elapsed * 2.4 + i * 1.1) * 0.5 + 0.5;
      const auraRadius = node.radius + (isActiveNode ? 3 + pulse * 4 : 2);

      // Outer aura
      ctx.beginPath();
      ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isActiveNode 
        ? `rgba(200, 90, 50, ${0.2 + pulse * 0.35})`
        : 'rgba(215, 207, 196, 0.25)';
      ctx.lineWidth = isActiveNode ? 1.4 : 1;
      ctx.stroke();

      // Node core
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isActiveNode ? (node.color === '#607768' ? '#4D7C5E' : '#C85A32') : 'rgba(95, 81, 72, 0.4)';
      ctx.fill();

      // Label text
      ctx.fillStyle = isActiveNode ? '#1A1A1A' : 'rgba(95, 81, 72, 0.65)';
      ctx.font = `500 ${node.fontSize}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      const isTopRow = node.y <= height * 0.35;
      const labelY = isTopRow 
        ? node.y - 19 
        : (node.y > height * 0.55 ? node.y + 13 : node.y - 10);
      ctx.fillText(node.label, node.x, labelY);
    });

    animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
  }

  // Battery/CPU optimization: pause animation loop when hero is offscreen
  const heroSection = document.getElementById('hero');
  if ('IntersectionObserver' in window && heroSection) {
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible && !animationFrameId) {
          startTime = performance.now();
          animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
        } else if (!isCanvasVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    }, { threshold: 0.05 });
    canvasObserver.observe(heroSection);
  } else {
    animationFrameId = requestAnimationFrame(drawArchitectureMatrix);
  }

  window.addEventListener('beforeunload', () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
// 6. Project Filter Controls & Expand/Collapse Pagination
// ---------------------------------------------------------------------------
const filterBar = document.querySelector('.filter-bar');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterIndicator = document.querySelector('.filter-indicator');
const additionalGrid = document.getElementById('additional-projects-grid') || document.querySelector('.additional-projects-grid');
const additionalCards = additionalGrid ? Array.from(additionalGrid.querySelectorAll('.project-card')) : [];
const featuredCards = Array.from(document.querySelectorAll('.featured-project'));
const toggleProjectsBtn = document.getElementById('projects-toggle-btn');

let isProjectsExpanded = false;
let activeCategory = 'all';
const INITIAL_VISIBLE_COUNT = 6;

function updateFilterIndicator(btn) {
  if (!btn || !filterIndicator) return;
  filterIndicator.style.transform = `translateX(${btn.offsetLeft}px)`;
  filterIndicator.style.width = `${btn.offsetWidth}px`;
}

function renderProjectsState() {
  // 1. Featured projects filter (always visible, filtered by category)
  featuredCards.forEach((card) => {
    const matches = activeCategory === 'all' || card.dataset.category === activeCategory;
    card.style.display = matches ? '' : 'none';
  });

  // 2. Additional projects grid: filter + limit to 6 if collapsed
  if (!additionalCards.length) return;

  const matchingAdditional = additionalCards.filter((card) => 
    activeCategory === 'all' || card.dataset.category === activeCategory
  );

  additionalCards.forEach((card) => {
    const matches = activeCategory === 'all' || card.dataset.category === activeCategory;
    if (!matches) {
      card.style.display = 'none';
      card.classList.remove('is-collapsed');
    }
  });

  matchingAdditional.forEach((card, idx) => {
    if (!isProjectsExpanded && idx >= INITIAL_VISIBLE_COUNT) {
      card.classList.add('is-collapsed');
      card.style.display = 'none';
    } else {
      card.classList.remove('is-collapsed');
      card.style.display = '';
    }
  });

  // 3. Update toggle button visibility and text
  if (toggleProjectsBtn) {
    const remainingCount = matchingAdditional.length - INITIAL_VISIBLE_COUNT;
    if (remainingCount <= 0) {
      toggleProjectsBtn.style.display = 'none';
    } else {
      toggleProjectsBtn.style.display = 'inline-flex';
      const textSpan = toggleProjectsBtn.querySelector('.toggle-btn-text');
      if (isProjectsExpanded) {
        toggleProjectsBtn.setAttribute('aria-expanded', 'true');
        if (textSpan) textSpan.textContent = 'COLLAPSE PROJECTS';
      } else {
        toggleProjectsBtn.setAttribute('aria-expanded', 'false');
        if (textSpan) {
          const categoryName = activeCategory === 'all' ? 'PROJECTS' : activeCategory.toUpperCase();
          textSpan.textContent = `SHOW ALL ${categoryName} (+${remainingCount})`;
        }
      }
    }
  }
}

if (toggleProjectsBtn) {
  toggleProjectsBtn.addEventListener('click', () => {
    isProjectsExpanded = !isProjectsExpanded;
    renderProjectsState();

    if (!isProjectsExpanded) {
      // Smoothly scroll back to additional projects heading
      const headEl = document.querySelector('.additional-projects-head');
      if (headEl) {
        headEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
    }
  });
}

if (filterBar && filterButtons.length) {
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

      activeCategory = btn.dataset.filter || 'all';
      renderProjectsState();
    });
  });
}

// Initial render of projects pagination & filter
renderProjectsState();

// ---------------------------------------------------------------------------
// 7. Instagram-Style Mobile Bottom Navigation Dock Controller
// ---------------------------------------------------------------------------
const mobileDock = document.getElementById('mobile-dock');
if (mobileDock) {
  const dockItems = Array.from(mobileDock.querySelectorAll('.mobile-dock-item'));
  const dockSections = [
    { id: 'work', fallbackId: 'projects' },
    { id: 'experience' },
    { id: 'expertise', fallbackId: 'skills' },
    { id: 'education' },
    { id: 'contact' },
  ];

  function setActiveDockItem(targetId) {
    dockItems.forEach((item) => {
      const section = item.dataset.section;
      const isActive = section === targetId || (section === 'work' && targetId === 'projects') || (section === 'expertise' && targetId === 'skills');
      item.classList.toggle('active', isActive);
      if (isActive) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  // Tap handling with smooth scroll and active bounce
  dockItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
          setActiveDockItem(item.dataset.section);
        }
      }
    });
  });

  // IntersectionObserver scroll tracking for mobile dock
  if ('IntersectionObserver' in window) {
    const observedElements = [];
    dockSections.forEach(({ id, fallbackId }) => {
      const el = document.getElementById(id) || (fallbackId ? document.getElementById(fallbackId) : null);
      if (el) observedElements.push({ id, el });
    });

    const dockObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = observedElements.find((o) => o.el === entry.target);
          if (match) setActiveDockItem(match.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    observedElements.forEach(({ el }) => dockObserver.observe(el));
  }
}

