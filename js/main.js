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

// ===========================================================================
// 12. Architectural Inspection Drawer System (Production Integration - Issue #12)
// ===========================================================================

/**
 * PROTOTYPE: Architectural Inspection Drawer for Flagship Systems
 * Supported Projects:
 *  - 2Wash: On-demand car care marketplace & PostGIS spatial dispatching
 *  - EduTracker: Multi-tenant education SaaS (64 relational entities, 40+ schools)
 *  - clientMORE: Bilingual applied RAG pipeline & multi-provider fallback
 *
 * Implements 3 Radically Different UI Variants:
 *  - Variant A: Slide-Over Blueprint Dock (Right-Side Multi-Tab Sheet)
 *  - Variant B: Bottom Engineering Console (Terminal / Observability Workbench)
 *  - Variant C: Executive System Matrix (Centered Master-Detail Transaction Flow)
 *
 * WCAG AA Accessibility:
 *  - Full keyboard navigation (Esc to close, Tab & Shift+Tab focus trap)
 *  - Restores focus to trigger element on close
 *  - ARIA attributes: role="dialog", aria-modal="true", aria-labelledby, aria-describedby
 *  - Arrow key cycling (Left / Right) on prototype switcher
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Prototype Definitions & State
  // ---------------------------------------------------------------------------
  const VARIANTS = [
    { key: 'A', name: 'Slide-Over Blueprint Dock' },
    { key: 'B', name: 'Bottom Engineering Console' },
    { key: 'C', name: 'Executive System Matrix' }
  ];

  let currentVariantIndex = 0;
  let currentProjectKey = '2wash';
  let isDrawerOpen = false;
  let lastActiveElement = null;

  // DOM Elements
  const overlay = document.getElementById('arch-drawer-overlay');
  const container = document.getElementById('arch-drawer-container');
  const protoKeyEl = document.getElementById('proto-key');
  const protoNameEl = document.getElementById('proto-name');
  const protoPrevBtn = document.getElementById('proto-prev-btn');
  const protoNextBtn = document.getElementById('proto-next-btn');
  const protoToggleBtn = document.getElementById('proto-toggle-drawer');

  // ---------------------------------------------------------------------------
  // 2. Data Models & Architectural Specifications
  // ---------------------------------------------------------------------------

  const ARCH_PROJECTS = {
    // -------------------------------------------------------------------------
    // 2Wash
    // -------------------------------------------------------------------------
    '2wash': {
      shortName: '2Wash',
      title: '2Wash System Architecture & Topology',
      kicker: 'COMMERCIAL SAAS · SAUDI ARABIA',
      desc: 'Bilingual on-demand car care marketplace connecting 20+ partner centers with 500+ commercial bookings across Riyadh & Jeddah. Powered by Django REST, PostGIS spatial indexing, and Celery asynchronous settlement pipelines.',
      stats: [
        { label: 'Scale', val: '20+ Centers · 500+ Bookings' },
        { label: 'Spatial SLA', val: 'P95 < 12ms (PostGIS)' },
        { label: 'Concurrency', val: 'Redis Distributed Locks' },
        { label: 'Ledger Guarantee', val: 'Idempotent ACID Settlements' }
      ],
      erdModels: [
        {
          name: 'partner_centers',
          badge: 'Spatial Hub',
          fields: [
            { name: 'id', type: 'UUID', key: 'PK' },
            { name: 'name', type: 'VARCHAR(120)', key: '' },
            { name: 'location', type: 'GEOMETRY(Point, 4326)', key: 'GIST' },
            { name: 'service_radius_m', type: 'INTEGER', key: '' },
            { name: 'commission_rate', type: 'NUMERIC(5,2)', key: '' },
            { name: 'is_active', type: 'BOOLEAN', key: '' }
          ]
        },
        {
          name: 'wash_bays',
          badge: 'Queue Resource',
          fields: [
            { name: 'id', type: 'UUID', key: 'PK' },
            { name: 'partner_id', type: 'UUID', key: 'FK' },
            { name: 'bay_number', type: 'SMALLINT', key: '' },
            { name: 'status', type: 'ENUM (AV/OCC/MAINT)', key: '' },
            { name: 'current_booking_id', type: 'UUID', key: 'FK' }
          ]
        },
        {
          name: 'booking_requests',
          badge: 'State Machine',
          fields: [
            { name: 'id', type: 'UUID', key: 'PK' },
            { name: 'customer_phone', type: 'VARCHAR(20)', key: 'OTP' },
            { name: 'partner_id', type: 'UUID', key: 'FK' },
            { name: 'vehicle_plate', type: 'VARCHAR(20)', key: '' },
            { name: 'total_sar', type: 'NUMERIC(10,2)', key: '' },
            { name: 'status', type: 'ENUM (FSM: 7 Steps)', key: '' }
          ]
        },
        {
          name: 'partner_settlements',
          badge: 'Financial Ledger',
          fields: [
            { name: 'id', type: 'UUID', key: 'PK' },
            { name: 'booking_id', type: 'UUID', key: 'FK / UQ' },
            { name: 'gross_sar', type: 'NUMERIC(10,2)', key: '' },
            { name: 'platform_fee_sar', type: 'NUMERIC(10,2)', key: '' },
            { name: 'partner_net_sar', type: 'NUMERIC(10,2)', key: '' },
            { name: 'idempotency_key', type: 'VARCHAR(64)', key: 'UQ' }
          ]
        }
      ],
      constraints: [
        {
          title: 'Sub-100ms Geospatial Hub Lookup',
          metric: '11.4ms P95',
          desc: 'Customer searches trigger spatial radius lookups across partner service polygons. We indexed PostGIS geometries with GIST R-tree indices rather than application-layer haversine filtering.',
          chosen: 'PostGIS ST_DWithin + GIST Index',
          rejected: 'In-memory Haversine filtering on unindexed rows'
        },
        {
          title: 'Zero Double-Booking in Physical Wash Bays',
          metric: 'Zero Concurrency Clashes',
          desc: 'Multiple customers requesting a bay simultaneously receive immediate atomic feedback through Redis distributed locks before securing row-level database locks (SELECT FOR UPDATE).',
          chosen: 'Redis Atomic Distributed Lock + SELECT FOR UPDATE',
          rejected: 'Optimistic timestamp checks with late rollback'
        },
        {
          title: 'Automated Financial Settlement Idempotency',
          metric: '100% Payout Accuracy',
          desc: 'Post-service commission splits and payouts run asynchronously via Celery. Idempotency keys prevent double-crediting partner bank accounts even during network retries.',
          chosen: 'Celery + Unique Idempotency Ledger Key',
          rejected: 'Synchronous HTTP webhooks during checkout'
        }
      ],
      telemetry: {
        consoleTitle: 'console://2wash.production.internal/inspect --arch --spatial --erd',
        nodes: [
          { name: '[LIVE] pg-postgis:15.4 (11.4ms)', service: 'postgis' },
          { name: '[LIVE] django-core:gunicorn (4w)', service: 'django' },
          { name: '[LIVE] redis-lock-broker:7.2', service: 'redis' },
          { name: '[LIVE] celery-worker (c:8)', service: 'celery' }
        ],
        stats: [
          { label: 'Spatial P95:', val: '11.4 ms' },
          { label: 'Active Centers:', val: '20 Hubs' },
          { label: 'Bay Locks:', val: '18 Active' },
          { label: 'Ledger Reconcile:', val: '100.00%' }
        ]
      },
      subtabs: [
        {
          name: '01_postgis_schema.sql',
          code: `-- 2Wash Flagship Production Schema & Spatial Indexes\nCREATE EXTENSION IF NOT EXISTS postgis;\n\nCREATE TABLE partner_centers (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(120) NOT NULL,\n  location GEOMETRY(Point, 4326) NOT NULL,\n  service_radius_m INTEGER NOT NULL DEFAULT 5000,\n  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,\n  is_active BOOLEAN NOT NULL DEFAULT TRUE\n);\n\n-- High-Performance GIST Index for Sub-100ms Radius Lookups\nCREATE INDEX idx_partner_centers_location_gist\nON partner_centers USING GIST (location);\n\nCREATE TABLE wash_bays (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  partner_id UUID NOT NULL REFERENCES partner_centers(id) ON DELETE CASCADE,\n  bay_number SMALLINT NOT NULL,\n  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'\n);\n\nCREATE TABLE partner_settlements (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  booking_id UUID NOT NULL UNIQUE,\n  gross_sar NUMERIC(10,2) NOT NULL,\n  platform_fee_sar NUMERIC(10,2) NOT NULL,\n  partner_net_sar NUMERIC(10,2) NOT NULL,\n  idempotency_key VARCHAR(64) NOT NULL UNIQUE\n);`
        },
        {
          name: '02_explain_spatial.sql',
          code: `-- Spatial Query Execution Plan on Riyadh Center Coordinates\nEXPLAIN ANALYZE\nSELECT id, name, commission_rate,\n       ST_Distance(location, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography) AS distance_meters\nFROM partner_centers\nWHERE is_active = TRUE\n  AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography, service_radius_m)\nORDER BY distance_meters ASC\nLIMIT 1;\n\n-- Bitmap Index Scan on idx_partner_centers_location_gist\n-- Planning Time: 0.18 ms | Execution Time: 0.42 ms (SLA < 12ms)`
        },
        {
          name: '03_settlement_ledger.sql',
          code: `-- Automated Financial Settlement Idempotent Insertion\nINSERT INTO partner_settlements (\n  id, partner_id, booking_id, gross_sar, platform_fee_sar, partner_net_sar, idempotency_key\n) VALUES (\n  gen_random_uuid(), 'p-012', 'c74a9-8812', 120.00, 18.00, 102.00, 'IDEMP-2WASH-c74a9-8812-COMPLETED'\n) ON CONFLICT (booking_id) DO NOTHING;`
        }
      ],
      transactionPhases: [
        {
          id: 'step-1',
          phase: 'Phase 01',
          title: 'Geo-Discovery & OTP Handshake',
          desc: 'Customer provides coordinates in Riyadh/Jeddah; PostGIS calculates closest partner polygon; OTP validates customer identity.',
          tiers: ['Next.js PWA', 'Cloudflare WAF', 'Django REST', 'PostGIS Engine', 'SMS Gateway'],
          sql: `-- Spatial query for nearest partner within service polygon\nSELECT id, name, commission_rate,\n       ST_Distance(location, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography) AS distance_meters\nFROM partner_centers\nWHERE is_active = TRUE\n  AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)::geography, service_radius_m)\nORDER BY distance_meters ASC\nLIMIT 1;`,
          mitigation: 'If geolocation is unavailable, fallback to postal district fallback dictionary with cached bounding boxes in Redis.'
        },
        {
          id: 'step-2',
          phase: 'Phase 02',
          title: 'Atomic Bay Reservation & Lock',
          desc: 'System acquires an atomic lock on the target wash bay in Redis with a 180s TTL while payment authorization completes.',
          tiers: ['Django REST', 'Redis Lock Manager', 'Mada / Apple Pay'],
          sql: `-- Redis distributed lock acquisition\nSET lock:bay:b01e2-4581 1 NX PX 180000\n\n-- Row lock during reservation commit\nSELECT id, status FROM wash_bays\nWHERE id = 'b01e2-4581' AND status = 'AVAILABLE'\nFOR UPDATE;`,
          mitigation: 'If customer abandons payment or gateway times out, Redis lock automatically expires at TTL, immediately freeing the bay.'
        },
        {
          id: 'step-3',
          phase: 'Phase 03',
          title: 'Finite State Machine Bay Queue',
          desc: 'Partner dashboard executes physical bay transitions: IN_BAY → WASHING → QUALITY_CHECK → COMPLETED.',
          tiers: ['Partner Next.js Portal', 'Django Channels / SSE', 'PostgreSQL DB'],
          sql: `-- Strict FSM status transition\nUPDATE booking_requests\nSET status = 'WASHING', updated_at = NOW()\nWHERE id = 'c74a9-8812'\n  AND status = 'IN_BAY';`,
          mitigation: 'State transitions validate legal transition matrix; invalid skips (e.g. BOOKED -> COMPLETED) trigger 409 Conflict.'
        },
        {
          id: 'step-4',
          phase: 'Phase 04',
          title: 'Automated Payout & Ledger Split',
          desc: 'Upon completion, Celery calculates partner commission net and platform fee, writing an immutable idempotent ledger row.',
          tiers: ['Celery Workers', 'Redis Broker', 'PartnerSettlementLedger', 'Banking API'],
          sql: `-- Idempotent financial settlement entry\nINSERT INTO partner_settlements (\n  id, partner_id, booking_id, gross_sar, platform_fee_sar, partner_net_sar, idempotency_key\n) VALUES (\n  gen_random_uuid(), 'p-012', 'c74a9-8812', 120.00, 18.00, 102.00, 'IDEMP-2WASH-c74a9-8812-COMPLETED'\n) ON CONFLICT (booking_id) DO NOTHING;`,
          mitigation: 'Celery worker crash during payout auto-requeues task; ON CONFLICT ensures zero double-crediting of partner accounts.'
        }
      ],
      svg: `
        <svg class="arch-svg-diagram" viewBox="0 0 680 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="2Wash Architectural Topology Diagram">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#b94a1f"/>
            </marker>
          </defs>
          <line x1="130" y1="70" x2="210" y2="70" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
          <line x1="130" y1="140" x2="210" y2="90" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
          <line x1="330" y1="80" x2="380" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
          <line x1="450" y1="120" x2="450" y2="180" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
          <line x1="450" y1="80" x2="520" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />
          <line x1="450" y1="220" x2="520" y2="220" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow)" />

          <g class="topo-node" tabindex="0" role="button" aria-label="Customer Next.js App">
            <rect x="20" y="45" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="32" y="68" fill="#241914" font-size="12" font-weight="600">Customer PWA</text>
            <text x="32" y="84" fill="#b94a1f" class="node-tag">Next.js / OTP</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Partner Operations Portal">
            <rect x="20" y="115" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="32" y="138" fill="#241914" font-size="12" font-weight="600">Partner SaaS</text>
            <text x="32" y="154" fill="#b94a1f" class="node-tag">Bay Dashboard</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="API Gateway & Ingress">
            <rect x="210" y="55" width="120" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="222" y="80" fill="#241914" font-size="12" font-weight="700">Nginx / Cloudflare</text>
            <text x="222" y="98" fill="#5f5148" class="node-tag">SSL &amp; Rate Limit</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Django REST Application Core">
            <rect x="380" y="50" width="140" height="70" rx="6" fill="#fff" stroke="#b94a1f" stroke-width="2" />
            <text x="394" y="76" fill="#241914" font-size="13" font-weight="700">Django REST API</text>
            <text x="394" y="94" fill="#b94a1f" class="node-tag">Business Logic &amp; FSM</text>
            <text x="394" y="108" fill="#607768" font-size="10">Sub-100ms Budget</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Celery Asynchronous Workers">
            <rect x="380" y="180" width="140" height="60" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="394" y="206" fill="#241914" font-size="12" font-weight="600">Celery Workers</text>
            <text x="394" y="224" fill="#5f5148" class="node-tag">Settlement Pipelines</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Redis Cache and Lock Broker">
            <rect x="530" y="55" width="130" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="542" y="80" fill="#241914" font-size="12" font-weight="700">Redis 7 Cluster</text>
            <text x="542" y="98" fill="#5f5148" class="node-tag">Bay Locks &amp; Broker</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="PostgreSQL and PostGIS Database">
            <rect x="530" y="180" width="130" height="70" rx="6" fill="#fffdfa" stroke="#b94a1f" stroke-width="2" />
            <text x="542" y="206" fill="#241914" font-size="13" font-weight="700">PostgreSQL 15</text>
            <text x="542" y="224" fill="#b94a1f" class="node-tag">+ PostGIS Spatial</text>
            <text x="542" y="238" fill="#607768" font-size="10">GIST R-Tree Indexed</text>
          </g>
        </svg>
      `
    },

    // -------------------------------------------------------------------------
    // EduTracker
    // -------------------------------------------------------------------------
    'edutracker': {
      shortName: 'EduTracker',
      title: 'EduTracker Multi-Tenant Isolation & Relational Core',
      kicker: 'ENTERPRISE MULTI-TENANT SAAS · EDUCATION',
      desc: 'Multi-tenant school operations SaaS orchestrating 40+ schools across 5 regional districts with 64 relational entities, strict row-level security via origin-scoped JWTs, and 665 automated CI test suites.',
      stats: [
        { label: 'Tenant Footprint', val: '40+ Schools · 5 Districts' },
        { label: 'Relational Scale', val: '64 Entities (Soft-Delete)' },
        { label: 'CI Verification', val: '665 Automated Tests (Green)' },
        { label: 'Subdomain SLA', val: 'P95 < 3ms Host Resolution' }
      ],
      erdModels: [
        {
          name: 'work_streams',
          badge: 'Tenant District',
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'workstream_name', type: 'VARCHAR(255)', key: '' },
            { name: 'subdomain', type: 'VARCHAR(63)', key: 'UQ / INDEX' },
            { name: 'capacity', type: 'INTEGER', key: 'Min(1)' },
            { name: 'user_capacity', type: 'INTEGER', key: '400 max' },
            { name: 'manager_id', type: 'BIGINT', key: 'FK' },
            { name: 'is_active', type: 'BOOLEAN', key: 'SoftDelete' }
          ]
        },
        {
          name: 'schools',
          badge: 'School Node',
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'school_name', type: 'VARCHAR(255)', key: '' },
            { name: 'work_stream_id', type: 'BIGINT', key: 'FK' },
            { name: 'country', type: 'VARCHAR(100)', key: 'INDEX' },
            { name: 'city', type: 'VARCHAR(100)', key: '' },
            { name: 'capacity', type: 'INTEGER', key: '' },
            { name: 'is_active', type: 'BOOLEAN', key: 'SoftDelete' }
          ]
        },
        {
          name: 'accounts_user',
          badge: 'Scoped Identity',
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'email', type: 'VARCHAR(254)', key: 'UQ / INDEX' },
            { name: 'role', type: 'VARCHAR(50)', key: '10 Roles' },
            { name: 'work_stream_id', type: 'BIGINT', key: 'FK' },
            { name: 'school_id', type: 'BIGINT', key: 'FK' },
            { name: 'verification_status', type: 'VARCHAR(30)', key: 'verified' }
          ]
        },
        {
          name: 'attendance',
          badge: 'High-Volume Ledger',
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'student_id', type: 'BIGINT', key: 'FK' },
            { name: 'class_room_id', type: 'BIGINT', key: 'FK' },
            { name: 'date', type: 'DATE', key: 'INDEX' },
            { name: 'status', type: 'VARCHAR(20)', key: 'INDEX' },
            { name: 'unique_date_student', type: 'CONSTRAINT', key: 'UQ' }
          ]
        }
      ],
      constraints: [
        {
          title: 'Row-Level Isolation vs Database-Per-Tenant',
          metric: '100% Policy-Scoped',
          desc: 'A single shared PostgreSQL database enforces bulletproof multi-tenant isolation through Django service policies and selector scoping on work_stream_id, avoiding the operational overhead of managing 40 separate databases.',
          chosen: 'Shared DB + Strict Service Policy Layer',
          rejected: 'Database-per-tenant with high DevOps sprawl'
        },
        {
          title: 'Origin-Scoped Sessions vs Shared Multi-Tenant Cookies',
          metric: 'Zero Cross-Tenant Leakage',
          desc: 'Subdomains (*.edutracker.site) store JWTs in origin-scoped sessionStorage. A user logged into one school subdomain arrives as an anonymous visitor at another, preventing cross-tenant privilege escalation.',
          chosen: 'Subdomain DNS + Origin-Scoped Storage',
          rejected: 'Global SSO cookies spanning all tenant subdomains'
        },
        {
          title: 'Async Task Worker Pools vs Blocking HTTP Execution',
          metric: 'Zero Gateway Timeouts',
          desc: 'Heavy administrative workloads (district-wide report card generation, monthly fee billing, mass attendance aggregation) are dispatched to Celery worker pools with Redis queues.',
          chosen: 'Celery Async Workers + Redis Broker',
          rejected: 'Synchronous HTTP request processing'
        }
      ],
      telemetry: {
        consoleTitle: 'console://edutracker.site.internal/inspect --tenancy --subdomains --erd',
        nodes: [
          { name: '[LIVE] postgresql-core:16.2 (4.1ms)', service: 'postgres' },
          { name: '[LIVE] django-multi-tenant:gunicorn', service: 'django' },
          { name: '[LIVE] redis-broker:7.2', service: 'redis' },
          { name: '[LIVE] celery-worker-pool (c:16)', service: 'celery' }
        ],
        stats: [
          { label: 'Subdomain P95:', val: '2.8 ms' },
          { label: 'Active Schools:', val: '40 Nodes' },
          { label: 'Relational Entities:', val: '64 Models' },
          { label: 'CI Test Pass:', val: '665 / 665' }
        ]
      },
      subtabs: [
        {
          name: '01_tenant_isolation.py',
          code: `# Django Multi-Tenant Policy Scoping\nclass WorkstreamPolicy:\n    @staticmethod\n    def scope_queryset(queryset, user):\n        if user.is_superuser or user.role == Role.ADMIN:\n            return queryset\n        return queryset.filter(work_stream_id=user.work_stream_id)\n\n# Enforced in all selector functions across 64 entities\ndef list_attendances_for_school(user, school_id, date):\n    WorkstreamPolicy.verify_school_access(user, school_id)\n    return Attendance.objects.filter(\n        class_room__school_id=school_id,\n        class_room__school__work_stream_id=user.work_stream_id,\n        date=date,\n        is_active=True\n    )`
        },
        {
          name: '02_subdomain_router.py',
          code: `# Subdomain Extraction from Host Header (P95 < 3ms)\ndef extract_subdomain(host: str) -> str | None:\n    clean_host = host.split(':')[0].lower()\n    if not clean_host.endswith('.edutracker.site'):\n        return None\n    sub = clean_host[:-len('.edutracker.site')]\n    if sub in RESERVED_SUBDOMAINS or not sub:\n        return None\n    return sub\n\n# Host sets the branding/login page; JWT scopes the data.`
        },
        {
          name: '03_attendance_ledger.sql',
          code: `-- High-Volume Attendance Ledger DDL\nCREATE TABLE attendance (\n  id BIGSERIAL PRIMARY KEY,\n  student_id BIGINT NOT NULL REFERENCES student(id) ON DELETE CASCADE,\n  class_room_id BIGINT NOT NULL REFERENCES class_room(id) ON DELETE CASCADE,\n  date DATE NOT NULL,\n  status VARCHAR(20) NOT NULL,\n  note TEXT,\n  recorded_by_id BIGINT REFERENCES teacher(id),\n  is_active BOOLEAN NOT NULL DEFAULT TRUE,\n  CONSTRAINT unique_student_classroom_date UNIQUE (student_id, class_room_id, date)\n);\nCREATE INDEX idx_attendance_date ON attendance (date);\nCREATE INDEX idx_attendance_status ON attendance (status);`
        }
      ],
      transactionPhases: [
        {
          id: 'step-1',
          phase: 'Phase 01',
          title: 'Wildcard Ingress & SSL Termination',
          desc: 'Student/Teacher browses al-huda.edutracker.site. Cloudflare Universal SSL terminates at edge and proxies wildcard traffic to Nginx.',
          tiers: ['Cloudflare Wildcard DNS', 'Nginx 1.24', 'Gunicorn WSGI'],
          sql: `# Nginx Wildcard Ingress\nserver {\n  server_name *.edutracker.site;\n  location / {\n    proxy_pass http://django_upstream;\n    proxy_set_header Host $http_host;\n  }\n}`,
          mitigation: 'Reserved domains (www, api, admin, mail) are guarded at Nginx and Django levels.'
        },
        {
          id: 'step-2',
          phase: 'Phase 02',
          title: 'Host Tenant Resolution & Branding',
          desc: 'Django Middleware inspects Host header, validates subdomain against work_streams table, and returns tenant theme metadata.',
          tiers: ['Django Middleware', 'WorkStream Model', 'PostgreSQL Cache'],
          sql: `SELECT id, workstream_name, subdomain, user_capacity\nFROM work_streams\nWHERE subdomain = 'al-huda'\n  AND is_active = TRUE\nLIMIT 1;`,
          mitigation: 'Unregistered subdomains fallback gracefully to main domain portal without leaking tenant metadata.'
        },
        {
          id: 'step-3',
          phase: 'Phase 03',
          title: 'Origin-Scoped JWT & Row-Level Scoping',
          desc: 'User authenticates; JWT is stored strictly in sessionStorage. All ORM queries append work_stream_id matching authenticated user.',
          tiers: ['CustomUser Auth', 'DRF Permissions', 'Row-Level Policy Engine'],
          sql: `SELECT * FROM attendance\nINNER JOIN student ON student.id = attendance.student_id\nWHERE student.work_stream_id = 4\n  AND attendance.date = CURRENT_DATE;`,
          mitigation: 'Attempting cross-tenant IDs raises PermissionDenied (403 Forbidden) logged to security telemetry.'
        },
        {
          id: 'step-4',
          phase: 'Phase 04',
          title: 'Async Celery Batch Processing',
          desc: 'End-of-term grade calculation and automated attendance PDF report card generation run asynchronously via Celery worker pools.',
          tiers: ['Celery Workers', 'Redis Message Broker', 'WeasyPrint PDF Engine'],
          sql: `# Celery task queue dispatch\ngenerate_gradebook_pdf.apply_async(\n  kwargs={'school_id': 12, 'term_id': 2},\n  queue='reports'\n)`,
          mitigation: 'Task retries back off exponentially; failure triggers admin notification with zero HTTP client timeouts.'
        }
      ],
      svg: `
        <svg class="arch-svg-diagram" viewBox="0 0 680 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="EduTracker Architectural Topology Diagram">
          <defs>
            <marker id="arrow-edu" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#1b4965"/>
            </marker>
          </defs>
          <line x1="130" y1="70" x2="210" y2="70" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />
          <line x1="130" y1="140" x2="210" y2="90" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />
          <line x1="330" y1="80" x2="380" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />
          <line x1="450" y1="120" x2="450" y2="180" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />
          <line x1="450" y1="80" x2="520" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />
          <line x1="450" y1="220" x2="520" y2="220" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-edu)" />

          <g class="topo-node" tabindex="0" role="button" aria-label="Subdomain Ingress">
            <rect x="20" y="45" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="30" y="68" fill="#241914" font-size="11" font-weight="600">*.edutracker.site</text>
            <text x="30" y="84" fill="#1b4965" class="node-tag">Wildcard DNS / SSL</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Origin-Scoped SPA">
            <rect x="20" y="115" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="30" y="138" fill="#241914" font-size="12" font-weight="600">React 19 SPA</text>
            <text x="30" y="154" fill="#1b4965" class="node-tag">Origin JWT Session</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Nginx Reverse Proxy">
            <rect x="210" y="55" width="120" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="222" y="80" fill="#241914" font-size="12" font-weight="700">Nginx Reverse Proxy</text>
            <text x="222" y="98" fill="#5f5148" class="node-tag">Host Header Forward</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Django Multi-Tenant Engine">
            <rect x="380" y="50" width="140" height="70" rx="6" fill="#fff" stroke="#1b4965" stroke-width="2" />
            <text x="394" y="76" fill="#241914" font-size="13" font-weight="700">Django Tenant Core</text>
            <text x="394" y="94" fill="#1b4965" class="node-tag">Row-Level Scoping</text>
            <text x="394" y="108" fill="#607768" font-size="10">665 Tests Verified</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Celery Report Workers">
            <rect x="380" y="180" width="140" height="60" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="394" y="206" fill="#241914" font-size="12" font-weight="600">Celery Worker Pool</text>
            <text x="394" y="224" fill="#5f5148" class="node-tag">Async PDF &amp; Billing</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Redis Message Broker">
            <rect x="530" y="55" width="130" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="542" y="80" fill="#241914" font-size="12" font-weight="700">Redis Broker</text>
            <text x="542" y="98" fill="#5f5148" class="node-tag">Queue &amp; Host Cache</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="PostgreSQL Database">
            <rect x="530" y="180" width="130" height="70" rx="6" fill="#fffdfa" stroke="#1b4965" stroke-width="2" />
            <text x="542" y="206" fill="#241914" font-size="13" font-weight="700">PostgreSQL 16</text>
            <text x="542" y="224" fill="#1b4965" class="node-tag">64 Relational Entities</text>
            <text x="542" y="238" fill="#607768" font-size="10">GIN Arabic Indexed</text>
          </g>
        </svg>
      `
    },

    // -------------------------------------------------------------------------
    // clientMORE
    // -------------------------------------------------------------------------
    'clientmore': {
      shortName: 'clientMORE',
      title: 'clientMORE System Architecture & Hybrid RAG',
      kicker: 'APPLIED RAG PIPELINE · MULTICHANNEL AI',
      desc: 'Bilingual AI support infrastructure featuring pure-Python hybrid retrieval (Dense + BM25 with RRF), resilient multi-provider LLM failover, and closed-loop human escalation with instant ChromaDB self-learning.',
      stats: [
        { label: 'Generation SLA', val: 'P95 < 800ms (Streaming)' },
        { label: 'Hybrid Retrieval', val: 'P95 < 95ms (Dense + BM25)' },
        { label: 'Intent Gating', val: 'Confidence >= 0.70' },
        { label: 'Provider Availability', val: '99.95% (Multi-Provider Chain)' }
      ],
      erdModels: [
        {
          name: 'documents',
          badge: 'Knowledge Base',
          fields: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'title', type: 'VARCHAR(255)', key: '' },
            { name: 'tenant_key', type: 'VARCHAR(255)', key: 'INDEX' },
            { name: 'content', type: 'TEXT', key: '' },
            { name: 'chunk_count', type: 'INTEGER', key: '' },
            { name: 'status', type: 'VARCHAR(20)', key: 'processing|ok' }
          ]
        },
        {
          name: 'conversations',
          badge: 'Session State',
          fields: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'channel', type: 'VARCHAR(50)', key: 'web|wa|tg' },
            { name: 'tenant_key', type: 'VARCHAR(255)', key: 'INDEX' },
            { name: 'customer_ref', type: 'VARCHAR(255)', key: '' },
            { name: 'status', type: 'VARCHAR(20)', key: 'open|closed' },
            { name: 'created_at', type: 'DATETIME', key: '' }
          ]
        },
        {
          name: 'handoffs',
          badge: 'Escalation FSM',
          fields: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'conversation_id', type: 'INTEGER', key: 'FK / INDEX' },
            { name: 'reason', type: 'TEXT', key: 'low_conf|user' },
            { name: 'status', type: 'VARCHAR(20)', key: 'pending|res' },
            { name: 'assigned_to', type: 'VARCHAR(255)', key: '' },
            { name: 'resolved_at', type: 'DATETIME', key: '' }
          ]
        },
        {
          name: 'learned_answers',
          badge: 'Self-Learning',
          fields: [
            { name: 'id', type: 'INTEGER', key: 'PK' },
            { name: 'tenant_key', type: 'VARCHAR(255)', key: 'INDEX' },
            { name: 'question', type: 'TEXT', key: '' },
            { name: 'answer', type: 'TEXT', key: '' },
            { name: 'source_handoff_id', type: 'INTEGER', key: 'FK' },
            { name: 'usage_count', type: 'INTEGER', key: '' }
          ]
        }
      ],
      constraints: [
        {
          title: 'Resilient Multi-Provider Fallback vs Vendor Lock-In',
          metric: '99.95% Availability',
          desc: 'Provider outages or rate limits trigger seamless fallback through an OpenAI-compatible interface (Gemini 2.5 Flash → DeepSeek-V3 → OpenAI) using persistent process-cached connection pools.',
          chosen: 'Ordered Provider Chain + Reusable httpx Pool',
          rejected: 'Single Provider SDK with late request crash'
        },
        {
          title: 'Pure-Python Hybrid Retrieval & Rank Fusion',
          metric: 'P95 < 95ms',
          desc: 'Eliminates heavy external search engines (Elastic/Meilisearch) by fusing dense vector embeddings with in-memory BM25 lexical search via Reciprocal Rank Fusion (k=60) and MMR diversity filtering.',
          chosen: 'ChromaDB Dense + Pure-Python BM25 / RRF',
          rejected: 'Dense-only vector search with poor keyword/ID recall'
        },
        {
          title: 'Closed-Loop Learning vs Periodic Offline Fine-Tuning',
          metric: 'Instant Indexing',
          desc: 'Resolved human agent handoffs automatically inject approved Q&A pairs into learned_answers and ChromaDB under deterministic keys (learned-{id}), instantly closing knowledge gaps.',
          chosen: 'Real-Time Closed-Loop Ingestion',
          rejected: 'Costly, delayed fine-tuning cycles with static models'
        }
      ],
      telemetry: {
        consoleTitle: 'console://clientmore.ai.internal/inspect --rag --hybrid --chroma',
        nodes: [
          { name: '[LIVE] chroma-hnsw:0.5 (18ms)', service: 'chroma' },
          { name: '[LIVE] fastapi-engine:uvicorn (4w)', service: 'fastapi' },
          { name: '[LIVE] provider-pool:gemini-deepseek', service: 'provider' },
          { name: '[LIVE] handoff-fsm:sqlite (4ms)', service: 'handoff' }
        ],
        stats: [
          { label: 'Retrieval P95:', val: '92.4 ms' },
          { label: 'Grounding Cutoff:', val: '>= 0.78' },
          { label: 'Provider Uptime:', val: '99.95%' },
          { label: 'Learned Sync:', val: '100.00%' }
        ]
      },
      subtabs: [
        {
          name: '01_hybrid_retrieval.py',
          code: `# Pure-Python Hybrid Retrieval with Reciprocal Rank Fusion (RRF)\ndef hybrid_search(query: str, k: int = 4, rrf_k: int = 60, mmr_lambda: float = 0.7):\n    # 1. Dense ChromaDB Cosine Search\n    dense_hits = vectorstore.query(query, k=k * 4)\n    # 2. In-Memory BM25 Lexical Search with Arabic Normalization\n    bm25_hits = bm25_index.search(normalize_arabic(query), k=k * 4)\n    # 3. Reciprocal Rank Fusion (RRF)\n    fused_scores = {}\n    for rank, hit in enumerate(dense_hits):\n        fused_scores[hit.id] = fused_scores.get(hit.id, 0.0) + 1.0 / (rrf_k + rank + 1)\n    for rank, hit in enumerate(bm25_hits):\n        fused_scores[hit.id] = fused_scores.get(hit.id, 0.0) + 1.0 / (rrf_k + rank + 1)\n    # 4. Maximal Marginal Relevance (MMR) for diversity\n    return apply_mmr(fused_scores, lambda_param=mmr_lambda, top_k=k)`
        },
        {
          name: '02_learned_sync.py',
          code: `# Deterministic Ingestion of Resolved Agent Answers\ndef sync_learned_answer(handoff_id: int, question: str, answer: str, db: Session):\n    learned = LearnedAnswer(\n        question=question,\n        answer=answer,\n        source_handoff_id=handoff_id\n    )\n    db.add(learned)\n    db.commit()\n    # Deterministic Chroma key prevents orphaned embeddings\n    vectorstore.upsert(\n        id=f"learned-{learned.id}",\n        text=f"{question}\\n{answer}",\n        metadata={"type": "learned", "handoff_id": handoff_id}\n    )`
        },
        {
          name: '03_escalation_fsm.sql',
          code: `-- Escalation FSM & Audit Ledger\nCREATE TABLE handoffs (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  conversation_id INTEGER NOT NULL REFERENCES conversations(id),\n  reason TEXT NOT NULL, -- 'low_confidence' | 'user_requested' | 'keyword_triggered'\n  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'assigned' | 'resolved'\n  assigned_to VARCHAR(255),\n  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  resolved_at DATETIME\n);\nCREATE INDEX idx_handoffs_conversation ON handoffs(conversation_id);`
        }
      ],
      transactionPhases: [
        {
          id: 'step-1',
          phase: 'Phase 01',
          title: 'Ingestion & Arabic Normalization',
          desc: 'Document upload triggers structure-aware chunking with custom Arabic text folding (folding alef/hamza/taa-marbuta, converting Eastern digits ٥->5).',
          tiers: ['FastAPI Router', 'Text Normalizer', 'Structure Chunker'],
          sql: `# Text Normalization snippet\ndef normalize_arabic(text: str) -> str:\n    text = re.sub(r'[\u064B-\u0652]', '', text) # Strip diacritics\n    text = re.sub(r'[إأآا]', 'ا', text)         # Fold alef forms\n    text = re.sub(r'[يى]', 'ي', text)           # Fold yaa forms\n    return text.translate(DIGIT_MAP)           # Fold Eastern digits`,
          mitigation: 'Corrupted documents or OCR failures are quarantined in "failed" state without polluting vector index.'
        },
        {
          id: 'step-2',
          phase: 'Phase 02',
          title: 'Multichannel Webhook Ingress',
          desc: 'Twilio WhatsApp, SMS, and WebSockets route into unified Channel ABC. System maps customer identity and opens conversation thread.',
          tiers: ['Twilio Webhooks', 'Channel Gateway', 'Conversation Router'],
          sql: `INSERT INTO conversations (channel, customer_ref, status)\nVALUES ('whatsapp', '+966501234567', 'open')\nRETURNING id;`,
          mitigation: 'Webhook signature verification rejects forged payloads; idempotency tokens prevent duplicate messages.'
        },
        {
          id: 'step-3',
          phase: 'Phase 03',
          title: 'Hybrid Retrieval & Provider Fallback',
          desc: 'Vector cosine similarity fuses with BM25. Prompt is assembled with grounded facts and sent to Gemini 2.5 Flash; on timeout or rate limit, DeepSeek-V3 takes over.',
          tiers: ['ChromaDB Vectorstore', 'Pure-Python BM25', 'OpenAI-Compatible Pool'],
          sql: `# Provider fallback loop\nfor provider in [gemini_client, deepseek_client, openai_client]:\n    try:\n        return provider.chat.completions.create(model=..., messages=...)\n    except (APIConnectionError, RateLimitError):\n        continue`,
          mitigation: 'Persistent httpx connection pools cut handshake latency; streaming tokens reduce perceived P95.'
        },
        {
          id: 'step-4',
          phase: 'Phase 04',
          title: 'Autonomous Handoff & Closed-Loop Sync',
          desc: 'When cosine similarity falls below threshold or model outputs __NO_ANSWER__, handoff FSM claims case. Agent resolution injects back into ChromaDB.',
          tiers: ['Handoff FSM', 'Agent Workspace', 'ChromaDB Incremental Upsert'],
          sql: `UPDATE handoffs\nSET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, assigned_to = 'agent_sami'\nWHERE id = 88;`,
          mitigation: 'Agent answers are verified against PII filters before entering learned_answers knowledge store.'
        }
      ],
      svg: `
        <svg class="arch-svg-diagram" viewBox="0 0 680 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="clientMORE Architectural Topology Diagram">
          <defs>
            <marker id="arrow-cm" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f766e"/>
            </marker>
          </defs>
          <line x1="130" y1="70" x2="210" y2="70" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />
          <line x1="130" y1="140" x2="210" y2="90" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />
          <line x1="330" y1="80" x2="380" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />
          <line x1="450" y1="120" x2="450" y2="180" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />
          <line x1="450" y1="80" x2="520" y2="80" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />
          <line x1="450" y1="220" x2="520" y2="220" stroke="#bfb3a6" stroke-width="2" marker-end="url(#arrow-cm)" />

          <g class="topo-node" tabindex="0" role="button" aria-label="Multichannel Ingress">
            <rect x="20" y="45" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="30" y="68" fill="#241914" font-size="12" font-weight="600">WhatsApp / Web</text>
            <text x="30" y="84" fill="#0f766e" class="node-tag">Twilio Webhooks</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Human Agent Desk">
            <rect x="20" y="115" width="110" height="50" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="30" y="138" fill="#241914" font-size="12" font-weight="600">Support Desk</text>
            <text x="30" y="154" fill="#0f766e" class="node-tag">Agent Escalation</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="FastAPI Gateway">
            <rect x="210" y="55" width="120" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="222" y="80" fill="#241914" font-size="12" font-weight="700">FastAPI Gateway</text>
            <text x="222" y="98" fill="#5f5148" class="node-tag">Session &amp; Channel ABC</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Hybrid Retrieval Engine">
            <rect x="380" y="50" width="140" height="70" rx="6" fill="#fff" stroke="#0f766e" stroke-width="2" />
            <text x="394" y="76" fill="#241914" font-size="13" font-weight="700">Hybrid RAG Engine</text>
            <text x="394" y="94" fill="#0f766e" class="node-tag">Dense + BM25 (RRF)</text>
            <text x="394" y="108" fill="#607768" font-size="10">P95 &lt; 95ms Budget</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="LLM Provider Failover Chain">
            <rect x="380" y="180" width="140" height="60" rx="6" fill="#fff" stroke="#d7cfc4" stroke-width="1.5" />
            <text x="394" y="206" fill="#241914" font-size="12" font-weight="600">Provider Failover</text>
            <text x="394" y="224" fill="#5f5148" class="node-tag">Gemini → DeepSeek</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="ChromaDB Vector Store">
            <rect x="530" y="55" width="130" height="60" rx="6" fill="#ede6d8" stroke="#bfb3a6" stroke-width="1.5" />
            <text x="542" y="80" fill="#241914" font-size="12" font-weight="700">ChromaDB Store</text>
            <text x="542" y="98" fill="#5f5148" class="node-tag">Cosine &amp; MMR Index</text>
          </g>
          <g class="topo-node" tabindex="0" role="button" aria-label="Closed-Loop Knowledge Store">
            <rect x="530" y="180" width="130" height="70" rx="6" fill="#fffdfa" stroke="#0f766e" stroke-width="2" />
            <text x="542" y="206" fill="#241914" font-size="13" font-weight="700">Learned Answers</text>
            <text x="542" y="224" fill="#0f766e" class="node-tag">Self-Learning Store</text>
            <text x="542" y="238" fill="#607768" font-size="10">Deterministic Keys</text>
          </g>
        </svg>
      `
    }
  };

  function getActiveArch() {
    return ARCH_PROJECTS[currentProjectKey] || ARCH_PROJECTS['2wash'];
  }

  // ---------------------------------------------------------------------------
  // 3. Variant Template Generators
  // ---------------------------------------------------------------------------

  /**
   * VARIANT A: Slide-Over Blueprint Dock
   */
  function renderVariantA() {
    const arch = getActiveArch();
    return `
      <div class="arch-drawer-sheet" role="document">
        <div class="arch-sheet-header">
          <div class="arch-sheet-top-row">
            <span class="arch-sheet-kicker">${arch.kicker}</span>
            <button type="button" class="arch-drawer-close-btn" data-close="arch-drawer" aria-label="Close architectural inspection drawer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <h2 id="arch-drawer-title" class="arch-drawer-title">${arch.title}</h2>
          <p id="arch-drawer-desc" class="arch-drawer-desc">${arch.desc}</p>
        </div>

        <div class="arch-tab-nav" role="tablist" aria-label="${arch.shortName} Architecture Views">
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-topo" aria-selected="true" aria-controls="panel-a-topo">01. System Topology</button>
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-erd" aria-selected="false" aria-controls="panel-a-erd">02. Data &amp; Schemas</button>
          <button type="button" class="arch-tab-btn" role="tab" id="tab-a-rules" aria-selected="false" aria-controls="panel-a-rules">03. Production Constraints</button>
        </div>

        <div class="arch-sheet-body">
          <!-- TAB 1: System Topology SVG Diagram -->
          <div id="panel-a-topo" class="arch-tab-panel active" role="tabpanel" aria-labelledby="tab-a-topo">
            <div class="arch-diagram-wrapper">
              ${arch.svg}
            </div>
            <div class="constraint-card">
              <div class="constraint-head">
                <span class="constraint-title">Interactive Subsystem Highlights</span>
                <span class="constraint-metric">${arch.shortName} Live Core</span>
              </div>
              <p class="constraint-text">Click or focus any node in the SVG diagram above to inspect its communication contracts, SLA latency budgets, and failover strategy.</p>
            </div>
          </div>

          <!-- TAB 2: Database Models & ERD -->
          <div id="panel-a-erd" class="arch-tab-panel" role="tabpanel" aria-labelledby="tab-a-erd">
            <div class="erd-grid">
              ${arch.erdModels.map(model => `
                <div class="erd-card">
                  <div class="erd-card-header">
                    <span class="erd-entity-name">${model.name}</span>
                    <span class="erd-badge">${model.badge}</span>
                  </div>
                  <table class="erd-table">
                    <thead>
                      <tr><th>Field</th><th>Type</th><th>Constraint</th></tr>
                    </thead>
                    <tbody>
                      ${model.fields.map(f => `
                        <tr>
                          <td><code>${f.name}</code></td>
                          <td><span class="type-badge">${f.type}</span></td>
                          <td><span class="constraint-badge ${f.key ? 'key' : ''}">${f.key || '—'}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- TAB 3: Production Constraints & Engineering Trade-Offs -->
          <div id="panel-a-rules" class="arch-tab-panel" role="tabpanel" aria-labelledby="tab-a-rules">
            <div class="constraints-list">
              ${arch.constraints.map(item => `
                <div class="constraint-card">
                  <div class="constraint-head">
                    <h3 class="constraint-title">${item.title}</h3>
                    <span class="constraint-metric">${item.metric}</span>
                  </div>
                  <p class="constraint-text">${item.desc}</p>
                  <div class="tradeoff-box">
                    <div class="tradeoff-item chosen">
                      <span class="tradeoff-label">Chosen Approach:</span>
                      <span class="tradeoff-val">${item.chosen}</span>
                    </div>
                    <div class="tradeoff-item rejected">
                      <span class="tradeoff-label">Rejected Alternative:</span>
                      <span class="tradeoff-val">${item.rejected}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="arch-sheet-footer">
          <div class="arch-stats-row">
            ${arch.stats.map(s => `
              <div class="arch-stat-cell">
                <span class="stat-label">${s.label}</span>
                <span class="stat-value">${s.val}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VARIANT B: Bottom Engineering Console
   */
  function renderVariantB() {
    const arch = getActiveArch();
    const subtabs = arch.subtabs || [];
    return `
      <div class="arch-console-drawer" role="document">
        <div class="console-chrome-bar">
          <div class="console-dots" aria-hidden="true">
            <span class="console-dot dot-red"></span>
            <span class="console-dot dot-yellow"></span>
            <span class="console-dot dot-green"></span>
          </div>
          <span class="console-title-text">${arch.telemetry.consoleTitle}</span>
          <button type="button" class="console-close-btn" data-close="arch-drawer" aria-label="Close engineering console">
            ESC [x]
          </button>
        </div>

        <div class="console-workbench">
          <!-- Left Telemetry & Service Tree -->
          <div class="console-sidebar">
            <p class="console-tree-title">Production Nodes (${arch.shortName})</p>
            ${arch.telemetry.nodes.map((node, i) => `
              <button type="button" class="console-tree-item ${i === 0 ? 'active' : ''}" data-service="${node.service}">
                <span class="status-pulse"></span> ${node.name}
              </button>
            `).join('')}

            <div class="console-telemetry-box">
              <span style="color:#f6c8a8;font-weight:700;">TELEMETRY STATS</span>
              ${arch.telemetry.stats.map(st => `
                <div class="telemetry-row"><span>${st.label}</span><span class="telemetry-val">${st.val}</span></div>
              `).join('')}
            </div>
          </div>

          <!-- Right Monospace Code & DDL Inspector -->
          <div class="console-main">
            <div class="console-tab-row">
              <div class="console-tabs" role="tablist">
                ${subtabs.map((tab, idx) => `
                  <button type="button" class="console-subtab-btn ${idx === 0 ? 'active' : ''}" role="tab" id="subtab-sql-${idx}">${tab.name}</button>
                `).join('')}
              </div>
              <button type="button" class="console-copy-btn" id="console-copy-trigger">Copy Code</button>
            </div>

            <div class="console-code-scroll" id="console-code-body">
              <pre><code>${subtabs.length > 0 ? escapeHtml(subtabs[0].code) : ''}</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * VARIANT C: Executive System Matrix
   */
  function renderVariantC() {
    const arch = getActiveArch();
    return `
      <div class="arch-matrix-modal" role="document">
        <div class="matrix-header">
          <div class="matrix-hero-info">
            <div class="matrix-tag-row">
              <span class="matrix-kicker">EXECUTIVE ARCHITECTURE MATRIX</span>
              ${arch.stats.map(s => `<span class="matrix-kpi-pill">${s.val}</span>`).join('')}
            </div>
            <h2 id="arch-drawer-title" class="matrix-title">${arch.shortName}: End-to-End Operational Lifecycle &amp; Subsystem Audit</h2>
          </div>
          <button type="button" class="arch-drawer-close-btn" data-close="arch-drawer" aria-label="Close architectural matrix">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="matrix-layout-body">
          <!-- Left Column: Transaction Lifecycle Walkthrough -->
          <div class="matrix-flow-col" role="tablist" aria-label="Transaction Lifecycle Steps">
            ${arch.transactionPhases.map((step, idx) => `
              <button type="button" class="flow-step-card ${idx === 0 ? 'active' : ''}" role="tab" id="step-tab-${step.id}" data-step="${step.id}" aria-selected="${idx === 0 ? 'true' : 'false'}">
                <span class="flow-step-phase">${step.phase}</span>
                <h4 class="flow-step-title">${step.title}</h4>
                <p class="flow-step-desc">${step.desc}</p>
              </button>
            `).join('')}
          </div>

          <!-- Right Column: Reactive Subsystem Spotlight -->
          <div class="matrix-inspect-col" id="matrix-inspect-panel" role="tabpanel">
            <!-- Dynamic Content populated by updateMatrixSpotlight() -->
          </div>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---------------------------------------------------------------------------
  // 4. View Controllers & Interaction Handlers
  // ---------------------------------------------------------------------------

  function updateMatrixSpotlight(stepId) {
    const inspectPanel = document.getElementById('matrix-inspect-panel');
    if (!inspectPanel) return;

    const arch = getActiveArch();
    const phase = arch.transactionPhases.find(p => p.id === stepId) || arch.transactionPhases[0];

    inspectPanel.innerHTML = `
      <div>
        <p class="inspect-section-title">Active Architecture Tiers</p>
        <div class="inspect-tier-pill-box">
          ${phase.tiers.map(tier => `<span class="inspect-tier-pill">${tier}</span>`).join('')}
        </div>
      </div>

      <div>
        <p class="inspect-section-title">Database Operation &amp; Execution Snippet</p>
        <div class="inspect-code-box">
          <pre><code>${escapeHtml(phase.sql)}</code></pre>
        </div>
      </div>

      <div>
        <p class="inspect-section-title">Production Failure Defense &amp; Self-Healing</p>
        <div class="inspect-mitigation-box">
          <strong>Production Safeguard:</strong> ${phase.mitigation}
        </div>
      </div>
    `;
  }

  function setupVariantInteractivity(variantKey) {
    const arch = getActiveArch();

    if (variantKey === 'A') {
      const tabBtns = container.querySelectorAll('.arch-tab-btn');
      const panels = container.querySelectorAll('.arch-tab-panel');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
          panels.forEach(p => p.classList.remove('active'));

          btn.setAttribute('aria-selected', 'true');
          const targetId = btn.getAttribute('aria-controls');
          const targetPanel = container.querySelector(`#${targetId}`);
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    } else if (variantKey === 'B') {
      const subtabs = container.querySelectorAll('.console-subtab-btn');
      const codeBody = container.querySelector('#console-code-body');
      const copyBtn = container.querySelector('#console-copy-trigger');
      const dataTabs = arch.subtabs || [];

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const codeEl = codeBody.querySelector('code');
          if (codeEl) {
            navigator.clipboard.writeText(codeEl.innerText).then(() => {
              copyBtn.textContent = 'Copied!';
              setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 1800);
            });
          }
        });
      }

      subtabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
          subtabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          if (dataTabs[idx]) {
            codeBody.innerHTML = `<pre><code>${escapeHtml(dataTabs[idx].code)}</code></pre>`;
          }
        });
      });
    } else if (variantKey === 'C') {
      const stepCards = container.querySelectorAll('.flow-step-card');
      const firstStepId = arch.transactionPhases[0] ? arch.transactionPhases[0].id : 'step-1';
      updateMatrixSpotlight(firstStepId);

      stepCards.forEach(card => {
        card.addEventListener('click', () => {
          stepCards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-selected', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-selected', 'true');
          const stepId = card.getAttribute('data-step');
          updateMatrixSpotlight(stepId);
        });
      });
    }

    // Attach close listeners inside drawer
    container.querySelectorAll('[data-close="arch-drawer"]').forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Drawer Lifecycle & Focus Trap
  // ---------------------------------------------------------------------------

  function renderCurrentVariant() {
    const variant = VARIANTS[currentVariantIndex];
    const arch = getActiveArch();

    // Update switcher UI
    if (protoKeyEl) protoKeyEl.textContent = `Variant ${variant.key}`;
    if (protoNameEl) protoNameEl.textContent = `${variant.name} (${arch.shortName})`;

    // Render variant into container
    if (container) {
      if (variant.key === 'A') {
        container.innerHTML = renderVariantA();
      } else if (variant.key === 'B') {
        container.innerHTML = renderVariantB();
      } else if (variant.key === 'C') {
        container.innerHTML = renderVariantC();
      }
      setupVariantInteractivity(variant.key);
    }
  }

  function openDrawer(projectKey) {
    if (!overlay) return;
    if (projectKey && ARCH_PROJECTS[projectKey]) {
      currentProjectKey = projectKey;
    }
    lastActiveElement = document.activeElement;
    isDrawerOpen = true;

    renderCurrentVariant();

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('arch-drawer-open');

    // Update aria-expanded on trigger buttons
    document.querySelectorAll('[data-arch-trigger]').forEach(btn => {
      const match = btn.getAttribute('data-arch-trigger') === currentProjectKey;
      btn.setAttribute('aria-expanded', match ? 'true' : 'false');
    });

    if (protoToggleBtn) protoToggleBtn.textContent = 'Close Drawer';

    // Focus first interactive element in drawer
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function closeDrawer() {
    if (!overlay || !isDrawerOpen) return;
    isDrawerOpen = false;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('arch-drawer-open');

    // Reset aria-expanded on trigger buttons
    document.querySelectorAll('[data-arch-trigger]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });

    const arch = getActiveArch();
    if (protoToggleBtn) protoToggleBtn.textContent = `Inspect ${arch.shortName}`;

    // Restore focus
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function setVariant(index) {
    currentVariantIndex = (index + VARIANTS.length) % VARIANTS.length;
    const variant = VARIANTS[currentVariantIndex];

    // Update URL search param
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.key);
    window.history.replaceState({}, '', url.toString());

    renderCurrentVariant();
  }

  // ---------------------------------------------------------------------------
  // 6. Global Event Bindings
  // ---------------------------------------------------------------------------

  // Backdrop click closes drawer
  if (overlay) {
    const backdrop = overlay.querySelector('.arch-drawer-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  // Prototype Switcher Prev/Next buttons
  if (protoPrevBtn) {
    protoPrevBtn.addEventListener('click', () => setVariant(currentVariantIndex - 1));
  }
  if (protoNextBtn) {
    protoNextBtn.addEventListener('click', () => setVariant(currentVariantIndex + 1));
  }

  // Switcher Toggle Drawer button
  if (protoToggleBtn) {
    protoToggleBtn.addEventListener('click', () => {
      if (isDrawerOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  // Card trigger buttons (Architecture & Schema) for 2Wash, EduTracker, clientMORE
  document.querySelectorAll('[data-arch-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const proj = btn.getAttribute('data-arch-trigger') || '2wash';
      openDrawer(proj);
    });
  });

  // Keyboard navigation: Escape key & Focus Trap
  document.addEventListener('keydown', (e) => {
    // Escape closes drawer
    if (isDrawerOpen && e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Switcher variant cycling: only when prototype switcher or its children are focused, or drawer is open
    const isSwitcherFocused = document.activeElement && document.activeElement.closest && document.activeElement.closest('#prototype-switcher');
    if (isSwitcherFocused && !isDrawerOpen) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setVariant(currentVariantIndex - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setVariant(currentVariantIndex + 1);
        return;
      }
    }

    if (!isDrawerOpen) return;

    // Arrow keys inside open drawer to switch variants
    if (e.key === 'ArrowLeft' && e.altKey) {
      e.preventDefault();
      setVariant(currentVariantIndex - 1);
      return;
    }
    if (e.key === 'ArrowRight' && e.altKey) {
      e.preventDefault();
      setVariant(currentVariantIndex + 1);
      return;
    }

    // Focus trap inside drawer
    if (e.key === 'Tab') {
      const focusables = Array.from(
        container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Initialization on Page Load
  // ---------------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const variantParam = (params.get('variant') || 'A').toUpperCase();
  const foundIndex = VARIANTS.findIndex(v => v.key === variantParam);
  currentVariantIndex = foundIndex !== -1 ? foundIndex : 0;

  const projectParam = (params.get('project') || '2wash').toLowerCase();
  if (ARCH_PROJECTS[projectParam]) {
    currentProjectKey = projectParam;
  }

  renderCurrentVariant();

  // If ?open=true in URL, auto-open drawer for direct inspection
  if (params.get('open') === 'true') {
    openDrawer(currentProjectKey);
  }
})();
