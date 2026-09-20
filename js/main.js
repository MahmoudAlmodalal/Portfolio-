const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

// Subtle entrance motion only. Content stays visible when JavaScript is unavailable.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
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
    threshold: 0.1,
    rootMargin: '0px 0px -6% 0px',
  });

  targets.forEach((element) => observer.observe(element));
}

// Project filters.
document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    document.querySelectorAll('.project-card').forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.toggleAttribute('hidden', !show);
    });
  });
});

// The card opens its primary destination without breaking nested links.
document.querySelectorAll('.project-card').forEach((card) => {
  const primaryLink = card.querySelector('.project-link');
  if (!primaryLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    window.open(primaryLink.href, '_blank', 'noopener');
  });
});

// Slightly firmer navigation after leaving the top of the page.
const nav = document.querySelector('nav');
let frame = 0;

function syncNav() {
  frame = 0;
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 32);
}

window.addEventListener('scroll', () => {
  if (frame) return;
  frame = requestAnimationFrame(syncNav);
}, { passive: true });
syncNav();

// Keep the current section clear in the navigation.
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
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

  sections.forEach((section) => sectionObserver.observe(section));
}
