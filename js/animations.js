/**
 * ===========================================================================
 * animations.js — Senior Creative Frontend Motion Layer
 * Mahmoud Hisham Almodalal Portfolio
 *
 * Core Principles:
 * - Only transform and opacity animations (no layout shifts, 60fps compositing)
 * - Standardized easing: cubic-bezier(0.22, 1, 0.36, 1)
 * - Durations: 500-900ms reveals, 200-300ms hover
 * - Stagger delays: 60-90ms
 * - Full prefers-reduced-motion override
 * - Mobile optimizations (<768px: subtle transforms, no heavy cursor/tilt)
 * ===========================================================================
 */

(function () {
  'use strict';

  // 1. Accessibility: Check for reduced motion preference
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // If reduced motion is preferred, bypass all animation sequences immediately
  if (isReducedMotion) {
    document.documentElement.classList.remove('motion-ready');
    const preloader = document.getElementById('page-preloader');
    if (preloader) preloader.style.display = 'none';

    // Show navbar directly
    const nav = document.getElementById('site-nav') || document.querySelector('nav');
    if (nav) nav.classList.add('nav-entered');

    // Reveal hero lines immediately
    document.querySelectorAll('.hero-line').forEach((line) => {
      line.classList.add('revealed');
    });

    const getsRealLine = document.querySelector('.drawn-underline');
    if (getsRealLine) getsRealLine.classList.add('active');

    return;
  }

  // ---------------------------------------------------------------------------
  // 1. LOADER: Clip-Path Exit (≤1.2s total duration)
  // ---------------------------------------------------------------------------
  function initLoader() {
    const preloader = document.getElementById('page-preloader');
    const preloaderBar = document.querySelector('.preloader-bar');
    if (!preloader) return;

    // Animate progress bar across 400ms
    setTimeout(() => {
      if (preloaderBar) preloaderBar.style.width = '100%';
    }, 100);

    // Trigger clip-path exit after 600ms (total cycle ≤ 1.2s)
    setTimeout(() => {
      preloader.classList.add('fade-out');

      // Enter navbar and hero directly after loader exit
      setTimeout(() => {
        initNavEntrance();
        initHeroReveal();
        preloader.style.display = 'none';
      }, 450);
    }, 600);
  }

  // ---------------------------------------------------------------------------
  // 2. NAVBAR: Entrance, Backdrop Blur on Scroll & Sliding Underline Indicator
  // ---------------------------------------------------------------------------
  function initNavEntrance() {
    const nav = document.getElementById('site-nav') || document.querySelector('nav');
    if (!nav) return;
    nav.classList.add('nav-entered');
  }

  function initNavScrollspy() {
    const navLinks = Array.from(document.querySelectorAll('nav ul a[href^="#"]'));
    const indicatorTrack = document.querySelector('.nav-indicator-track');
    const indicatorBar = document.querySelector('.nav-indicator-bar');
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!indicatorTrack || !indicatorBar || !sections.length) return;

    function moveIndicatorToLink(link) {
      if (!link) {
        indicatorTrack.style.width = '0px';
        return;
      }
      const linkRect = link.getBoundingClientRect();
      const parentRect = link.closest('ul').getBoundingClientRect();
      const leftOffset = linkRect.left - parentRect.left;
      indicatorTrack.style.transform = `translateX(${leftOffset}px)`;
      indicatorTrack.style.width = `${linkRect.width}px`;
    }

    // Scrollspy observer
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (!visible) return;
          const targetId = visible.target.id;
          const activeLink = navLinks.find((l) => l.getAttribute('href') === `#${targetId}`);

          navLinks.forEach((l) => {
            const isActive = l === activeLink;
            l.classList.toggle('active', isActive);
            if (isActive) l.setAttribute('aria-current', 'page');
            else l.removeAttribute('aria-current');
          });

          if (activeLink && !isMobile) {
            moveIndicatorToLink(activeLink);
          }
        },
        { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.3] }
      );

      sections.forEach((s) => observer.observe(s));
    }

    // Update indicator on click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (!isMobile) moveIndicatorToLink(link);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 3. HERO: Mask Reveal, "gets real" Drawn Underline & Magnetic Buttons
  // ---------------------------------------------------------------------------
  function initHeroReveal() {
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('revealed');
      }, index * 90);
    });

    // Draw gets real underline with slight delay
    setTimeout(() => {
      const drawnUnderline = document.querySelector('.drawn-underline');
      if (drawnUnderline) drawnUnderline.classList.add('active');
    }, heroLines.length * 90 + 200);

    // Stagger entry for kicker, description, ledger, actions, and profile
    const heroStaggerItems = [
      document.querySelector('.hero-kicker-wrap'),
      document.querySelector('.hero-desc'),
      document.querySelector('.hero-architecture-signal'),
      document.querySelector('.hero-ledger'),
      document.querySelector('.hero-actions'),
      document.querySelector('.hero-profile'),
    ].filter(Boolean);

    heroStaggerItems.forEach((item, idx) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(16px)';
      item.style.transition = `opacity 650ms var(--ease) ${idx * 80}ms, transform 650ms var(--ease) ${idx * 80}ms`;
      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. SELECTED WORK: Parallax on Scroll, Image Hover Zoom, FLIP Filter Animation
  // ---------------------------------------------------------------------------
  function initFeaturedProjects() {
    const featuredCards = document.querySelectorAll('.featured-project');

    // Scroll reveal + Parallax on images
    if ('IntersectionObserver' in window && !isMobile) {
      window.addEventListener(
        'scroll',
        () => {
          featuredCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const img = card.querySelector('.project-card-img img');
              const num = card.querySelector('.project-num');
              // Parallax factor bounded between -24px and +24px
              const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height) - 0.5;
              if (img) img.style.transform = `translateY(${progress * 28}px) scale(1)`;
              if (num) num.style.transform = `translateY(${progress * -18}px)`;
            }
          });
        },
        { passive: true }
      );
    }

    // FLIP Animation for Filter Bar
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allCards = Array.from(document.querySelectorAll('.project-card'));

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Step 1: FIRST - Record original positions
        const firstPositions = new Map();
        allCards.forEach((card) => {
          if (!card.hasAttribute('hidden')) {
            firstPositions.set(card, card.getBoundingClientRect());
          }
        });

        // Step 2: LAST - Toggle visibility
        allCards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          if (match) {
            card.removeAttribute('hidden');
          } else {
            card.setAttribute('hidden', '');
          }
        });

        // Step 3: INVERT & PLAY - Animate from First to Last position smoothly
        allCards.forEach((card) => {
          if (!card.hasAttribute('hidden') && firstPositions.has(card)) {
            const first = firstPositions.get(card);
            const last = card.getBoundingClientRect();
            const deltaX = first.left - last.left;
            const deltaY = first.top - last.top;

            if (deltaX !== 0 || deltaY !== 0) {
              card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
              card.style.transition = 'none';

              requestAnimationFrame(() => {
                card.style.transition = 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms cubic-bezier(0.22, 1, 0.36, 1)';
                card.style.transform = 'translate(0, 0)';
              });
            }
          }
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. ADDITIONAL WORK: Stagger Grid Reveal on Scroll & Smooth Hover
  // ---------------------------------------------------------------------------
  function initAdditionalWorkGrid() {
    const grid = document.querySelector('.additional-projects-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.project-card');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            // Reveal in sequence
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, (index % 3) * 80);
            });
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -4% 0px' }
      );

      observer.observe(grid);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. EXPERIENCE: Vertical Timeline Progressive Reveal & Node Illumination
  // ---------------------------------------------------------------------------
  function initTimelineMotion() {
    const timeline = document.querySelector('.timeline');
    const items = document.querySelectorAll('.tl-item');
    if (!timeline || !items.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('tl-active');
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );

      items.forEach((item) => observer.observe(item));
    }
  }

  // ---------------------------------------------------------------------------
  // 7. EXPERTISE & SKILLS: Stagger Entry & Hover Border Glow
  // ---------------------------------------------------------------------------
  function initSkillsMotion() {
    const rows = document.querySelectorAll('.expertise-row');
    if (!rows.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
      );

      rows.forEach((row, idx) => {
        row.style.transitionDelay = `${idx * 80}ms`;
        observer.observe(row);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. EDUCATION & CERTIFICATIONS: Scale 0.96 -> 1 Reveal
  // ---------------------------------------------------------------------------
  function initEducationMotion() {
    const certItems = document.querySelectorAll('.cert-item');
    if (!certItems.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
      );

      certItems.forEach((item, idx) => {
        item.style.transitionDelay = `${(idx % 2) * 75}ms`;
        observer.observe(item);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 9. CONTACT FINALE: Typography Reveal & Magnetic Actions
  // ---------------------------------------------------------------------------
  function initContactMotion() {
    const contactInner = document.querySelector('.contact-inner');
    if (!contactInner) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(contactInner);
    }
  }

  // ---------------------------------------------------------------------------
  // 10. MAGNETIC BUTTON INTERACTIONS (Desktop with fine pointer only)
  // ---------------------------------------------------------------------------
  function initMagneticButtons() {
    if (isMobile || !window.matchMedia('(pointer: fine)').matches) return;

    const targets = document.querySelectorAll('.magnet-target');
    targets.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Subtle magnetic pull (max 4-5px)
        btn.style.transform = `translate3d(${x * 0.16}px, ${y * 0.16}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 11. DESKTOP PRECISION CURSOR
  // ---------------------------------------------------------------------------
  function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor || isMobile || !window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      { passive: true }
    );

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      const ring = cursor.querySelector('.cursor-ring');
      if (ring) {
        ring.style.transform = `translate3d(${ringX - mouseX}px, ${ringY - mouseY}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactives = document.querySelectorAll('a, button, .project-card, .magnet-target');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZE ALL ANIMATION MODULES ON DOM READY
  // ---------------------------------------------------------------------------
  function initAll() {
    document.documentElement.classList.add('motion-ready');
    initLoader();
    initNavScrollspy();
    initFeaturedProjects();
    initAdditionalWorkGrid();
    initTimelineMotion();
    initSkillsMotion();
    initEducationMotion();
    initContactMotion();
    initMagneticButtons();
    initCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
