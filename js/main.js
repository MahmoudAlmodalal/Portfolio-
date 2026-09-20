// Portfolio interaction system — CMS-inspired motion without framework overhead.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function closeMenu() {
  const button = document.querySelector('.hamburger');
  const menu = document.querySelector('nav ul');
  if (!button || !menu) return;
  button.classList.remove('active');
  menu.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
}
window.closeMenu = closeMenu;

// Accessible mobile navigation.
const menuButton = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');
if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    const nextOpen = !navMenu.classList.contains('open');
    menuButton.classList.toggle('active', nextOpen);
    navMenu.classList.toggle('open', nextOpen);
    menuButton.setAttribute('aria-expanded', String(nextOpen));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

// Progressive reveal system. Content stays visible if JS is unavailable.
if (!reducedMotion.matches) {
  document.documentElement.classList.add('motion-ready');

  const revealTargets = [
    ...document.querySelectorAll('.fade-in'),
    ...document.querySelectorAll('section .section-label, section h2, .additional-projects-head h3, .additional-projects-desc'),
  ];

  revealTargets.forEach((element) => {
    if (!element.classList.contains('fade-in')) element.classList.add('reveal-copy');

    const section = element.closest('section');
    if (section) {
      const peers = [...section.querySelectorAll('.fade-in, .reveal-copy')];
      const index = Math.max(0, peers.indexOf(element));
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px',
  });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

// Project filters with small exit/enter choreography instead of abrupt popping.
document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;

    document.querySelectorAll('.project-card').forEach((card, index) => {
      const shouldShow = filter === 'all' || card.dataset.category === filter;

      if (shouldShow) {
        card.removeAttribute('data-hidden');
        card.style.display = '';
        card.classList.remove('filter-enter');
        requestAnimationFrame(() => {
          card.classList.add('filter-enter');
          card.style.setProperty('--filter-delay', `${Math.min(index, 7) * 35}ms`);
        });
      } else {
        card.setAttribute('data-hidden', 'true');
        card.style.display = 'none';
        card.classList.remove('filter-enter');
      }
    });
  });
});

// Make project cards clickable while preserving normal link behavior.
document.querySelectorAll('.project-card').forEach((card) => {
  const link = card.querySelector('.project-link');
  if (link) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => {
      if (!event.target.closest('a, button')) {
        window.open(link.href, '_blank', 'noopener');
      }
    });
  }
});

// Scroll state: progress, nav compression, scroll cue, and active section.
const nav = document.querySelector('nav');
const scrollIndicator = document.querySelector('.scroll-indicator');
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.appendChild(progress);

let scrollFrame = 0;
function updateScrollUI() {
  scrollFrame = 0;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const ratio = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  progress.style.transform = `scaleX(${ratio})`;

  if (nav) nav.classList.toggle('scrolled', window.scrollY > 48);
  if (scrollIndicator) scrollIndicator.classList.toggle('hidden', window.scrollY > 110);
}

window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-28% 0px -58% 0px',
    threshold: [0.05, 0.2, 0.45],
  });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

// Gentle pointer depth on the hero terminal and project cards.
// Motion is intentionally tiny; this is tactile feedback, not a 3D showcase.
if (!reducedMotion.matches && finePointer.matches) {
  const hero = document.querySelector('#hero');
  const terminal = document.querySelector('.terminal');

  if (hero && terminal) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      terminal.style.setProperty('--hero-tilt-x', `${(-y * 2.2).toFixed(2)}deg`);
      terminal.style.setProperty('--hero-tilt-y', `${(x * 2.6).toFixed(2)}deg`);
      hero.style.setProperty('--orb-x', `${(x * 16).toFixed(1)}px`);
      hero.style.setProperty('--orb-y', `${(y * 12).toFixed(1)}px`);
    });

    hero.addEventListener('pointerleave', () => {
      terminal.style.setProperty('--hero-tilt-x', '0deg');
      terminal.style.setProperty('--hero-tilt-y', '0deg');
      hero.style.setProperty('--orb-x', '0px');
      hero.style.setProperty('--orb-y', '0px');
    });
  }

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const tiltY = (x - 0.5) * 2.2;
      const tiltX = (0.5 - y) * 1.8;

      card.style.setProperty('--card-tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--card-tilt-y', `${tiltY.toFixed(2)}deg`);
      card.style.setProperty('--spot-x', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--spot-y', `${(y * 100).toFixed(1)}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--card-tilt-x', '0deg');
      card.style.setProperty('--card-tilt-y', '0deg');
    });
  });
}
