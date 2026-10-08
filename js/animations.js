/**
 * ===========================================================================
 * animations.js — Motion Layer
 * Engineering Studio Motion Experience for Mahmoud H. Almodalal Portfolio
 *
 * Rules & Standards:
 * - GPU Compositing: transforms & opacity only (zero layout shifts).
 * - Easing: cubic-bezier(0.16, 1, 0.3, 1) mapped to GSAP power3.out / CSS.
 * - Durations: fast & subtle (300-600ms), hover 180ms, stagger 60ms.
 * - Progressive enhancement: .js-anim added by JS only if reduced motion is false.
 * - Every scroll reveal triggers once only.
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
  const durationRevealMs = parseFloat(computedRoot.getPropertyValue('--duration-reveal')) || 550;
  const staggerDelayMs = parseFloat(computedRoot.getPropertyValue('--stagger-delay')) || 60;
  const durationRevealSec = durationRevealMs / 1000;
  const staggerDelaySec = staggerDelayMs / 1000;

  // Ensure GSAP & ScrollTrigger exist
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------------------------------------------------------------------------
  // 1. LOADER: Fast Non-blocking Lifecycle (≤ 700ms total), Slide-Up Exit
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

    // Preloader begins fade + slide-up exit at 320ms
    setTimeout(() => {
      preloader.classList.add('fade-out');

      // Start Hero reveal concurrently as preloader exits (zero dead time)
      if (onHeroStart) onHeroStart();

      // Completely remove preloader from view at 660ms
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 340);
    }, 320);
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

    function updateScrollspy() {
      const scrollPos = (window.scrollY || document.documentElement.scrollTop) + 120;
      if ((window.scrollY || document.documentElement.scrollTop) < 140) {
        navLinks.forEach((l) => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });
        indicatorTrack.style.opacity = '0';
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sectionIds[i]);
        if (sec && sec.offsetTop <= scrollPos) {
          const link = navLinks.find((l) => l.getAttribute('href') === `#${sectionIds[i]}`);
          if (link) setActiveLink(link);
          break;
        }
      }
    }

    window.addEventListener('scroll', updateScrollspy, { passive: true });

    // Update immediately on click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setActiveLink(link);
      });
    });

    window.addEventListener('resize', () => {
      const activeLink = navLinks.find((l) => l.classList.contains('active'));
      if (activeLink) moveIndicator(activeLink);
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // 3. HERO: Staggered Fade-Up of Headline, Subtitle, Buttons, and Profile Panel
  // ---------------------------------------------------------------------------
  function initHero() {
    const heroWords = document.querySelectorAll('.hero-word');
    const drawnUnderline = document.querySelector('.drawn-underline');
    const heroFadeUps = Array.from(document.querySelectorAll('.hero-fade-up'));

    if (!hasGSAP) {
      // Fallback CSS staggered reveals
      heroWords.forEach((word, idx) => {
        setTimeout(() => word.classList.add('revealed'), idx * staggerDelayMs);
      });
      heroFadeUps.forEach((el, idx) => {
        setTimeout(() => el.classList.add('is-visible', 'revealed'), 100 + idx * staggerDelayMs);
      });
      setTimeout(() => {
        if (drawnUnderline) drawnUnderline.classList.add('active');
      }, heroWords.length * staggerDelayMs + 80);
      return;
    }

    // GSAP Orchestrated Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step A: Word-by-word masked reveal
    if (heroWords.length) {
      tl.fromTo(heroWords,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: durationRevealSec,
          stagger: disableHeavyMotion ? 0.025 : staggerDelaySec,
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
      }, '-=0.3');
    }

    // Step C: Staggered entrance for all hero elements
    if (heroFadeUps.length) {
      tl.fromTo(heroFadeUps,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: durationRevealSec * 0.85,
          stagger: disableHeavyMotion ? 0.03 : staggerDelaySec,
          onComplete: () => {
            heroFadeUps.forEach((el) => el.classList.add('is-visible', 'revealed'));
          },
        },
        '-=0.35'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SCROLL REVEAL: IntersectionObserver for Sections and Cards (One-shot)
  // ---------------------------------------------------------------------------
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .fade-in');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible', 'visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      });

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('is-visible', 'visible'));
    }
  }

  // ---------------------------------------------------------------------------
  // 5. FEATURED WORK: Parallax & Hover Interactions
  // ---------------------------------------------------------------------------
  function initFeaturedProjects() {
    const featuredCards = document.querySelectorAll('.featured-project');
    if (!featuredCards.length) return;

    featuredCards.forEach((card) => {
      // Subtle Image Parallax (±20px): desktop only, disabled on touch/mobile
      if (!disableHeavyMotion && hasGSAP) {
        const img = card.querySelector('.project-card-img img');
        if (img) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              const y = (self.progress - 0.5) * 36;
              img.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
            },
          });
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. EXPERIENCE TIMELINE: Vertical Line Draw + Dot Pulse on Viewport Entry
  // ---------------------------------------------------------------------------
  function initTimelineProgress() {
    const timeline = document.getElementById('experience-timeline');
    if (!timeline) return;

    const spineProgress = timeline.querySelector('.tl-spine-progress');
    const items = Array.from(timeline.querySelectorAll('.tl-item'));

    function onScrollTimeline() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;

      // Calculate vertical drawing progress based on scroll position
      const triggerStart = vh * 0.70;
      const triggerEnd = vh * 0.35;
      const timelineHeight = rect.height;

      if (spineProgress) {
        if (rect.top > triggerStart) {
          spineProgress.style.transform = 'scaleY(0)';
        } else if (rect.bottom < triggerEnd) {
          spineProgress.style.transform = 'scaleY(1)';
        } else {
          const progress = Math.min(1, Math.max(0, (triggerStart - rect.top) / (timelineHeight + (triggerStart - triggerEnd))));
          spineProgress.style.transform = `scaleY(${progress.toFixed(3)})`;
        }
      }

      // Activate and pulse dots as each experience milestone is reached
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const dot = item.querySelector('.tl-dot');
        const isActive = itemRect.top < vh * 0.65;

        item.classList.toggle('tl-active', isActive);
        if (dot) dot.classList.toggle('is-active', isActive);
      });
    }

    window.addEventListener('scroll', onScrollTimeline, { passive: true });
    onScrollTimeline();
  }

  // ---------------------------------------------------------------------------
  // 7. PROJECT FILTER: Sliding Tab Indicator & Smooth FLIP Card Transitions
  // ---------------------------------------------------------------------------
  function initFilterFlip() {
    const filterBar = document.querySelector('.filter-bar');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const indicator = document.querySelector('.filter-indicator');
    const allCards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
    if (!filterBar || !filterButtons.length || !allCards.length) return;

    // Reposition the sliding indicator pill
    function moveFilterIndicator(btn) {
      if (!btn || !indicator) return;
      indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
      indicator.style.width = `${btn.offsetWidth}px`;
    }

    // Initial position on active button
    const initialActive = filterBar.querySelector('.filter-btn.active') || filterButtons[0];
    if (initialActive) {
      // Allow slight frame settle for initial measurement
      requestAnimationFrame(() => moveFilterIndicator(initialActive));
    }

    window.addEventListener('resize', () => {
      const currentActive = filterBar.querySelector('.filter-btn.active');
      if (currentActive) moveFilterIndicator(currentActive);
    }, { passive: true });

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        moveFilterIndicator(btn);

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

        // Step 3: INVERT — Compute delta offsets and apply counter-transform
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
              // Newly revealed card: smooth fade & gentle upward settle
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

            // Clean up inline styles after transition finishes
            setTimeout(() => {
              animatingCards.forEach((card) => {
                card.style.transition = '';
                card.style.transform = '';
                card.style.opacity = '';
              });
              if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 320);
          });
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION: Orchestrate Motion Suite on DOM Ready
  // ---------------------------------------------------------------------------
  function initMotionSuite() {
    initNavbar();
    initScrollReveal();
    initFeaturedProjects();
    initTimelineProgress();
    initFilterFlip();

    // Fast non-blocking preloader handles smooth hero entrance
    initLoader(() => {
      initHero();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionSuite);
  } else {
    initMotionSuite();
  }
})();
