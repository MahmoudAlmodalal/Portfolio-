// Close mobile menu
function closeMenu() {
  document.querySelector('.hamburger').classList.remove('active');
  document.querySelector('nav ul').classList.remove('open');
}

// Intersection Observer for fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Project filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.setAttribute('data-hidden', 'false');
        card.style.display = '';
      } else {
        card.setAttribute('data-hidden', 'true');
        card.style.display = 'none';
      }
    });
  });
});

// Make project cards clickable
document.querySelectorAll('.project-card').forEach(card => {
  const link = card.querySelector('.project-link');
  if (link) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.open(link.href, '_blank');
      }
    });
  }
});

// Hide scroll indicator on scroll
const scrollInd = document.querySelector('.scroll-indicator');
if (scrollInd) {
  window.addEventListener('scroll', () => {
    scrollInd.style.opacity = window.scrollY > 100 ? '0' : '1';
    scrollInd.style.transition = 'opacity .3s';
  }, { passive: true });
}
