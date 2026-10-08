/**
 * ===========================================================================
 * animations.js — Motion Layer (Phase 1)
 * Engineering Studio Motion Experience for Mahmoud H. Almodalal Portfolio
 *
 * Rules & Standards:
 * - GPU Compositing: transforms & opacity only (zero layout shifts).
 * - Easing: cubic-bezier(0.22, 1, 0.36, 1) mapped to GSAP power3.out / CSS.
 * - Durations: reveals 600-800ms, hover 200ms, stagger 70ms.
 * - Progressive enhancement: .js-anim added by JS only if reduced motion is false.
 * - Every reveal triggers once only.
 * - Parallax and heavy staggers disabled on mobile (<768px) and touch devices.
 * ===========================================================================
 */

(function () {
  'use strict';

  // 0. Progressive Enhancement & Accessibility Guard
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Leave DOM completely untouched in its static, fully visible default state
    return;
  }

  // Add .js-anim class to enable motion styles safely
  document.documentElement.classList.add('js-anim');

  // Device capabilities detection
  const isMobile = window.innerWidth < 768;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const disableHeavyMotion = isMobile || isTouch;

  // Read root motion tokens for synchronicity
  const computedRoot = getComputedStyle(document.documentElement);
  const durationRevealMs = parseFloat(computedRoot.getPropertyValue('--duration-reveal')) || 700;
  const staggerDelayMs = parseFloat(computedRoot.getPropertyValue('--stagger-delay')) || 70;
  const durationRevealSec = durationRevealMs / 1000;
  const staggerDelaySec = staggerDelayMs / 1000;

  // Ensure GSAP & ScrollTrigger exist
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------------------------------------------------------------------------
  // 1. LOADER: Fast Lifecycle (≤ 700ms total), Slide-Up Exit, No Delay for Hero
  // ---------------------------------------------------------------------------
  function initLoader(onHeroStart) {
    const preloader = document.getElementById('page-preloader');
    const bar = document.querySelector('.preloader-bar');
    if (!preloader) {
      if (onHeroStart) onHeroStart();
      return;
    }

    // Progress line expands rapidly (0 -> 100% via transform: scaleX)
    requestAnimationFrame(() => {
      if (bar) bar.style.transform = 'scaleX(1)';
    });

    // Preloader begins fade + slide-up exit at 340ms
    setTimeout(() => {
      preloader.classList.add('fade-out');

      // Start Hero reveal immediately as preloader starts its exit (zero dead time)
      if (onHeroStart) onHeroStart();

      // Completely remove preloader from view at 680ms (≤ 700ms total)
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 340);
    }, 340);
  }

  // ---------------------------------------------------------------------------
  // 2. NAVBAR: Scroll Blur/Shadow & Sliding Underline Indicator (Scrollspy)
  // ---------------------------------------------------------------------------
  function initNavbar() {
    const nav = document.getElementById('site-nav') || document.querySelector('nav');
    const indicatorTrack = document.querySelector('.nav-indicator-track');
    const navLinks = Array.from(document.querySelectorAll('nav ul a[href^="#"]'));

    // 2.1 Scroll elevation (blur & shadow)
    function onScrollNav() {
      const isScrolled = (window.scrollY || document.documentElement.scrollTop) > 24;
      if (nav) nav.classList.toggle('scrolled', isScrolled);
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    // 2.2 Sliding Underline Indicator (Pure Transform: translateX + scaleX)
    if (!indicatorTrack || !navLinks.length || disableHeavyMotion) return;

    function moveIndicator(link) {
      if (!link) {
        indicatorTrack.style.opacity = '0';
        return;
      }
      const ul = link.closest('ul');
      if (!ul) return;

      const parentRect = ul.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const leftOffset = linkRect.left - parentRect.left;
      const width = linkRect.width;

      indicatorTrack.style.opacity = '1';
      indicatorTrack.style.transform = `translateX(${leftOffset}px) scaleX(${width})`;
    }

    function setActiveLink(link) {
      navLinks.forEach((l) => {
        const isActive = l === link;
        l.classList.toggle('active', isActive);
        if (isActive) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
      moveIndicator(link);
    }

    // Scrollspy tracking matching sections
    const sectionIds = ['projects', 'experience', 'skills', 'education', 'references', 'contact'];
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      const link = navLinks.find((l) => l.getAttribute('href') === `#${id}`);
      if (!section || !link) return;

      if (hasGSAP) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 40%',
          end: 'bottom 40%',
          onEnter: () => setActiveLink(link),
          onEnterBack: () => setActiveLink(link),
        });
      }
    });

    // Update on click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => setActiveLink(link));
    });

    // Reset indicator when scrolled back to Hero top
    window.addEventListener('scroll', () => {
      if ((window.scrollY || document.documentElement.scrollTop) < 120) {
        navLinks.forEach((l) => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });
        indicatorTrack.style.opacity = '0';
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // 3. HERO: Word-by-Word Mask Reveal, Drawn Underline & Staggered Elements
  // ---------------------------------------------------------------------------
  function initHero() {
    const heroWords = document.querySelectorAll('.hero-word');
    const drawnUnderline = document.querySelector('.drawn-underline');
    const heroDesc = document.querySelector('.hero-desc');
    const heroActions = document.querySelector('.hero-actions');
    const profileCards = document.querySelectorAll('.profile-card');

    if (!hasGSAP) {
      // Fallback if GSAP is not present: simple CSS class reveal
      heroWords.forEach((word, idx) => {
        setTimeout(() => word.classList.add('revealed'), idx * staggerDelayMs);
      });
      setTimeout(() => {
        if (drawnUnderline) drawnUnderline.classList.add('active');
      }, heroWords.length * staggerDelayMs + 100);
      return;
    }

    // GSAP Orchestrated Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step A: Word-by-word masked reveal
    if (heroWords.length) {
      tl.fromTo(heroWords,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: durationRevealSec,
          stagger: disableHeavyMotion ? 0.03 : staggerDelaySec,
          onComplete: () => {
            heroWords.forEach((word) => word.classList.add('revealed'));
          },
        }
      );
    }

    // Step B: Underline on "gets real" smoothly draws (scaleX 0 -> 1)
    if (drawnUnderline) {
      tl.add(() => {
        drawnUnderline.classList.add('active');
      }, '-=0.25');
    }

    // Step C: Paragraph entry
    if (heroDesc) {
      tl.fromTo(heroDesc,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: durationRevealSec * 0.9 },
        '-=0.2'
      );
    }

    // Step D: Actions (buttons) entry
    if (heroActions) {
      tl.fromTo(heroActions,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: durationRevealSec * 0.9 },
        '-=0.3'
      );
    }

    // Step E: 4 stack cards enter with stagger (70ms)
    if (profileCards.length) {
      tl.fromTo(profileCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: durationRevealSec * 0.9,
          stagger: disableHeavyMotion ? 0.03 : staggerDelaySec,
        },
        '-=0.25'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SELECTED WORK: Scroll Reveal (translateY 32px), Parallax (±20px), Zoom
  // ---------------------------------------------------------------------------
  function initFeaturedProjects() {
    const featuredCards = document.querySelectorAll('.featured-project');
    if (!featuredCards.length) return;

    featuredCards.forEach((card) => {
      // 4.1 Card Reveal: fade + translateY(32px), executes once only
      if (hasGSAP) {
        gsap.fromTo(card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: durationRevealSec,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true, // Reveal once only!
            },
          }
        );
      }

      // 4.2 Subtle Image Parallax (±20px): desktop only, disabled on touch/mobile
      if (!disableHeavyMotion && hasGSAP) {
        const img = card.querySelector('.project-card-img img');
        if (img) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              // self.progress ranges from 0 to 1
              // Center is 0.5 -> parallax factor maps to [-20px, +20px]
              const y = (self.progress - 0.5) * 40;
              img.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
            },
          });
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. PROJECT FILTER: Smooth FLIP Transitions Between Matching Cards
  // ---------------------------------------------------------------------------
  function initFilterFlip() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allCards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
    if (!filterButtons.length || !allCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Step 1: FIRST — Record bounding boxes of currently visible cards
        const firstPositions = new Map();
        allCards.forEach((card) => {
          if (!card.hasAttribute('hidden') && card.offsetParent !== null) {
            firstPositions.set(card, card.getBoundingClientRect());
          }
        });

        // Step 2: LAST — Toggle hidden state based on filter
        allCards.forEach((card) => {
          const matches = (filter === 'all' || card.dataset.category === filter);
          if (matches) {
            card.removeAttribute('hidden');
          } else {
            card.setAttribute('hidden', '');
          }
        });

        // Step 3: INVERT — Invert positions and prepare transitions
        const animatingCards = [];
        allCards.forEach((card) => {
          if (!card.hasAttribute('hidden')) {
            const first = firstPositions.get(card);
            const last = card.getBoundingClientRect();

            if (first) {
              const dx = first.left - last.left;
              const dy = first.top - last.top;
              if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                card.style.transform = `translate(${dx}px, ${dy}px)`;
                card.style.transition = 'none';
                animatingCards.push(card);
              }
            } else {
              // Newly displayed card: smooth fade & small upward settle
              card.style.opacity = '0';
              card.style.transform = 'translateY(16px)';
              card.style.transition = 'none';
              animatingCards.push(card);
            }
          }
        });

        // Step 4: PLAY — Animate to natural layout position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            animatingCards.forEach((card) => {
              card.style.transition = 'transform var(--duration-filter) var(--ease), opacity var(--duration-filter) var(--ease)';
              card.style.transform = 'translate(0, 0)';
              card.style.opacity = '1';
            });

            // Cleanup inline styles after animation finishes
            setTimeout(() => {
              animatingCards.forEach((card) => {
                card.style.transition = '';
                card.style.transform = '';
                card.style.opacity = '';
              });
              if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 350);
          });
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION: Orchestrate Phase 1 on DOM Ready
  // ---------------------------------------------------------------------------
  function initPhase1() {
    initNavbar();
    initFeaturedProjects();
    initFilterFlip();

    // Loader handles hero start smoothly without delay
    initLoader(() => {
      initHero();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhase1);
  } else {
    initPhase1();
  }
})();
