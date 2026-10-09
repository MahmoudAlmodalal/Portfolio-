/**
 * ===========================================================================
 * animations.js — Motion Design System
 * Mahmoud Hisham Almodalal Portfolio
 *
 * Rules & Architecture:
 * - GPU Composited: transform and opacity only (zero layout shifts).
 * - Fast & Subtle: 300-550ms durations, 180ms hover, 60-80ms staggers.
 * - Progressive Enhancement: 100% visible by default; .js-anim added only if
 *   prefers-reduced-motion is false.
 * - One-shot scroll reveals: unobserved once in view.
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

  // Add .js-anim class to enable motion safely
  document.documentElement.classList.add('js-anim');

  const isMobile = window.innerWidth < 768;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------------------------------------------------------------------------
  // 1. Navigation: Scroll Blur/Shadow & Sliding Underline Indicator
  // ---------------------------------------------------------------------------
  function initNavbar() {
    const nav = document.getElementById('site-nav') || document.querySelector('nav');
    const indicatorTrack = document.querySelector('.nav-indicator-track');
    const navLinks = Array.from(document.querySelectorAll('nav ul a[href^="#"]'));

    // 1.1 Header scroll elevation (blur & shadow)
    function onScrollNav() {
      const isScrolled = (window.scrollY || document.documentElement.scrollTop) > 24;
      if (nav) nav.classList.toggle('scrolled', isScrolled);
    }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    // 1.2 Sliding Underline Indicator (Pure Transform: translateX + scaleX)
    if (!indicatorTrack || !navLinks.length || isMobile) return;

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

    // Scrollspy tracking active section
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
  // 2. Hero: Staggered Fade-Up of Headline, Subtitle, and Buttons on Load
  // ---------------------------------------------------------------------------
  function initHero() {
    const heroWords = document.querySelectorAll('.hero-word');
    const drawnUnderline = document.querySelector('.drawn-underline');
    const heroFadeUps = Array.from(document.querySelectorAll('.hero-fade-up'));

    if (!hasGSAP) {
      // CSS Fallback
      heroWords.forEach((word, idx) => {
        setTimeout(() => word.classList.add('revealed'), idx * 35);
      });
      heroFadeUps.forEach((el, idx) => {
        setTimeout(() => el.classList.add('is-visible', 'revealed'), 120 + idx * 70);
      });
      setTimeout(() => {
        if (drawnUnderline) drawnUnderline.classList.add('active');
      }, heroWords.length * 35 + 60);
      return;
    }

    // GSAP Orchestrated Staggered Entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroWords.length) {
      tl.fromTo(
        heroWords,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.03,
          onComplete: () => {
            heroWords.forEach((word) => word.classList.add('revealed'));
          },
        }
      );
    }

    if (drawnUnderline) {
      tl.add(() => {
        drawnUnderline.classList.add('active');
      }, '-=0.25');
    }

    if (heroFadeUps.length) {
      tl.fromTo(
        heroFadeUps,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.06,
          onComplete: () => {
            heroFadeUps.forEach((el) => el.classList.add('is-visible', 'revealed'));
          },
        },
        '-=0.3'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Scroll Reveal: IntersectionObserver for Sections and Cards (One-shot)
  // ---------------------------------------------------------------------------
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.scroll-reveal, .fade-in, .section-heading, .additional-projects-head, .expertise-row, .reference-row, .cert-item'
    );
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible', 'visible');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.08,
        }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('is-visible', 'visible'));
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Featured Work: Subtle Image Parallax on Desktop
  // ---------------------------------------------------------------------------
  function initFeaturedProjects() {
    if (isMobile || !hasGSAP) return;

    const featuredCards = document.querySelectorAll('.featured-project');
    featuredCards.forEach((card) => {
      const img = card.querySelector('.project-card-img img');
      if (!img) return;

      ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const y = (self.progress - 0.5) * 24;
          img.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
        },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Experience Timeline: Dynamic Spine & Vertical Draw with Dot Pulse
  // ---------------------------------------------------------------------------
  function initTimelineProgress() {
    const timeline = document.getElementById('experience-timeline');
    if (!timeline) return;

    const spine = timeline.querySelector('.tl-spine');
    const spineProgress = timeline.querySelector('.tl-spine-progress');
    const items = Array.from(timeline.querySelectorAll('.tl-item'));

    // Precision measurement: anchor spine top at center of dot 1, end at center of dot 5
    function updateSpineGeometry() {
      const dots = timeline.querySelectorAll('.tl-dot');
      if (dots.length < 2 || !spine) return;

      const firstDot = dots[0];
      const lastDot = dots[dots.length - 1];
      const timelineRect = timeline.getBoundingClientRect();
      const firstRect = firstDot.getBoundingClientRect();
      const lastRect = lastDot.getBoundingClientRect();

      const topOffset = firstRect.top - timelineRect.top + firstRect.height / 2;
      const spineHeight = lastRect.top - firstRect.top;

      spine.style.top = `${topOffset}px`;
      spine.style.height = `${spineHeight}px`;
    }

    updateSpineGeometry();
    window.addEventListener('resize', updateSpineGeometry, { passive: true });

    function onScrollTimeline() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;

      // Scroll progress mapping
      const triggerStart = vh * 0.72;
      const triggerEnd = vh * 0.35;
      const timelineHeight = rect.height;

      if (spineProgress) {
        if (rect.top > triggerStart) {
          spineProgress.style.transform = 'scaleY(0)';
        } else if (rect.bottom < triggerEnd) {
          spineProgress.style.transform = 'scaleY(1)';
        } else {
          const progress = Math.min(
            1,
            Math.max(0, (triggerStart - rect.top) / (timelineHeight + (triggerStart - triggerEnd)))
          );
          spineProgress.style.transform = `scaleY(${progress.toFixed(3)})`;
        }
      }

      // Activate dot and pulse when each experience milestone enters view
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
  // 6. Project Filter: Handled centrally in main.js for full a11y & reduced-motion
  // ---------------------------------------------------------------------------
  function initFilterTabs() {
    // Managed in main.js
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION: Run on DOMContentLoaded with immediate Hero entrance
  // ---------------------------------------------------------------------------
  function initMotionSuite() {
    initNavbar();
    initHero();
    initScrollReveal();
    initFeaturedProjects();
    initTimelineProgress();
    initFilterTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionSuite);
  } else {
    initMotionSuite();
  }
})();
