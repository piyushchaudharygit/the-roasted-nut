/**
 * THE ROASTED NUTS – script.js
 * Vanilla JavaScript | ES6+ | No libraries
 *
 * Features:
 *  1.  JS body class (progressive enhancement for nav)
 *  2.  Dynamic copyright year
 *  3.  Sticky header scroll effect
 *  4.  Mobile navigation (hamburger, Escape, outside-click)
 *  5.  Menu category filter with stagger animation
 *  6.  Order dialog (open / close / backdrop / Escape)
 *  7.  Scroll reveal via IntersectionObserver
 *  8.  3-D tilt effect on favourite cards (pointer-fine only)
 *  9.  Hero parallax (requestAnimationFrame, disabled on mobile)
 * 10.  Image error fallback
 * 11.  Smooth anchor scrolling
 * 12.  Reduced-motion preference respected throughout
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */

  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => [...(context || document).querySelectorAll(selector)];

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isPointerFine = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ─────────────────────────────────────────────────────────────
     1. PROGRESSIVE ENHANCEMENT CLASS
  ───────────────────────────────────────────────────────────── */

  document.documentElement.classList.add('js');

  /* ─────────────────────────────────────────────────────────────
     2. DYNAMIC COPYRIGHT YEAR
  ───────────────────────────────────────────────────────────── */

  const yearEl = $('#footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ─────────────────────────────────────────────────────────────
     3. STICKY HEADER
  ───────────────────────────────────────────────────────────── */

  const siteHeader = $('#site-header');

  if (siteHeader) {
    const updateHeader = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ─────────────────────────────────────────────────────────────
     4. MOBILE NAVIGATION
  ───────────────────────────────────────────────────────────── */

  const menuToggle = $('#menu-toggle');
  const navPanel   = $('#nav-panel');

  function openNav() {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    navPanel.classList.add('is-open');
    document.body.classList.add('modal-open');
  }

  function closeNav() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    navPanel.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  if (menuToggle && navPanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    $$('.nav-link, .nav-cta', navPanel).forEach(link => {
      link.addEventListener('click', () => {
        if (navPanel.classList.contains('is-open')) closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navPanel.classList.contains('is-open')) {
        closeNav();
        menuToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        navPanel.classList.contains('is-open') &&
        !navPanel.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        closeNav();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. MENU CATEGORY FILTER
        Reads data-category from each .product-card.
        The filter buttons use data-filter attributes.
        Supports: all | fast-food | bakery | beverages | chocolates | chips
  ───────────────────────────────────────────────────────────── */

  const filterButtons = $$('.filter-button');
  const menuCards     = $$('.product-card[data-category]');
  const menuCountEl   = $('#menu-count');

  function updateMenuCount(count) {
    if (menuCountEl) {
      menuCountEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }
  }

  function filterMenu(filter) {
    let visibleCount = 0;

    menuCards.forEach((card, index) => {
      const matches = filter === 'all' || card.dataset.category === filter;

      if (matches) {
        card.removeAttribute('hidden');
        card.style.transitionDelay = prefersReducedMotion()
          ? '0ms'
          : `${(index % 8) * 40}ms`;
        visibleCount++;
      } else {
        card.setAttribute('hidden', '');
        card.style.transitionDelay = '0ms';
      }
    });

    updateMenuCount(visibleCount);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      filterMenu(btn.dataset.filter);
    });
  });

  // Initialise with total count
  updateMenuCount(menuCards.length);

  /* ─────────────────────────────────────────────────────────────
     6. ORDER DIALOG
        Uses the native <dialog> element for built-in accessibility.
        Opens when any [data-product-name] element is clicked.
        Closes on backdrop click, close/cancel buttons, Escape.
  ───────────────────────────────────────────────────────────── */

  const orderDialog     = $('#order-dialog');
  const dialogClose     = $('#dialog-close');
  const dialogCancel    = $('#dialog-cancel');
  const dialogProductEl = $('#dialog-product-name');

  function openOrderDialog(productName) {
    if (!orderDialog) return;
    if (dialogProductEl) {
      dialogProductEl.textContent = productName;
    }
    orderDialog.showModal();
    document.body.classList.add('modal-open');
  }

  function closeOrderDialog() {
    if (!orderDialog) return;
    orderDialog.close();
    document.body.classList.remove('modal-open');
  }

  // Delegate: any [data-product-name] click opens the dialog
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-product-name]');
    if (trigger) {
      // Allow normal anchor/button behaviour for non-order triggers (e.g. WhatsApp link)
      const tagName = trigger.tagName.toLowerCase();
      if (tagName === 'a' && trigger.href && !trigger.dataset.productName) return;

      e.preventDefault();
      openOrderDialog(trigger.dataset.productName);
    }
  });

  if (dialogClose)  dialogClose.addEventListener('click',  closeOrderDialog);
  if (dialogCancel) dialogCancel.addEventListener('click', closeOrderDialog);

  // Backdrop click closes dialog
  if (orderDialog) {
    orderDialog.addEventListener('click', (e) => {
      if (e.target === orderDialog) closeOrderDialog();
    });

    // Native dialog Escape fires cancel event — sync body class
    orderDialog.addEventListener('cancel', () => {
      document.body.classList.remove('modal-open');
    });
  }

  /* ─────────────────────────────────────────────────────────────
     7. SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────────────────────── */

  const revealEls = $$('.reveal-ready');

  if (revealEls.length) {
    if (prefersReducedMotion()) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ─────────────────────────────────────────────────────────────
     8. 3-D TILT EFFECT (Favourite cards)
  ───────────────────────────────────────────────────────────── */

  if (!prefersReducedMotion() && isPointerFine()) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
        const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
        const maxTilt = 6;
        card.style.transform = `perspective(1000px) rotateX(${-dy * maxTilt}deg) rotateY(${dx * maxTilt}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. HERO PARALLAX
  ───────────────────────────────────────────────────────────── */

  const parallaxEl = $('#hero-parallax');

  if (parallaxEl && !prefersReducedMotion()) {
    let isTicking = false;

    const applyParallax = () => {
      if (window.innerWidth <= 768) {
        parallaxEl.style.transform = 'none';
        isTicking = false;
        return;
      }

      const heroSection = parallaxEl.closest('.hero');
      const heroBottom  = heroSection ? heroSection.getBoundingClientRect().bottom : 0;

      if (heroBottom < 0) {
        isTicking = false;
        return;
      }

      const offset = window.scrollY * 0.18;
      parallaxEl.style.transform = `translate3d(0, ${offset}px, 0)`;
      isTicking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!isTicking) {
          requestAnimationFrame(applyParallax);
          isTicking = true;
        }
      },
      { passive: true }
    );
  }

  /* ─────────────────────────────────────────────────────────────
     10. IMAGE ERROR FALLBACK
  ───────────────────────────────────────────────────────────── */

  $$('.media img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      img.closest('.media')?.classList.add('image-failed');
    }
    img.addEventListener('error', () => {
      img.closest('.media')?.classList.add('image-failed');
    });
  });

  /* ─────────────────────────────────────────────────────────────
     11. SMOOTH ANCHOR SCROLLING
  ───────────────────────────────────────────────────────────── */

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'instant' : 'smooth',
        block: 'start',
      });

      history.pushState(null, '', targetId);
    });
  });

})();
