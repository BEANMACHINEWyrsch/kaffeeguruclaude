/* ====================================================================
   KAFFEE GURU — Premium Site Interactions
   ==================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------
     STICKY HEADER — shrink on scroll
     ------------------------------------------------------------ */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 24) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------
     MOBILE NAV TOGGLE
     ------------------------------------------------------------ */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active');
      document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ------------------------------------------------------------
     REVEAL ON SCROLL — IntersectionObserver
     ------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------
     STAT COUNTERS — animate from 0 to data-target when in view
     ------------------------------------------------------------ */
  const counters = document.querySelectorAll('[data-target]');
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      el.textContent = Math.round(target * eased).toLocaleString('de-CH') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  /* ------------------------------------------------------------
     PARALLAX HERO ILLUSTRATION — subtle mouse-follow
     ------------------------------------------------------------ */
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__illustration');
  const heroLogo = document.querySelector('.hero__logo-mark');
  if (hero && heroImg && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      heroImg.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      if (heroLogo) heroLogo.style.transform = `translate(${x * -14}px, ${y * -14}px) rotate(${Date.now() / 100 % 360}deg)`;
    });
    hero.addEventListener('mouseleave', () => {
      heroImg.style.transform = '';
    });
  }

  /* ------------------------------------------------------------
     STORY — Editorial chapter reader (Über mich)
     ------------------------------------------------------------ */
  const story = document.querySelector('.story');
  if (story) {
    const navItems = story.querySelectorAll('.story__nav-item');
    const chapters = story.querySelectorAll('.story__chapter');
    const rail = story.querySelector('.story__rail');
    const railProgress = story.querySelector('.story__rail-progress');
    const progressLabel = story.querySelector('.story__progress strong');
    const totalLabel = story.querySelector('.story__progress-total');
    const prevBtn = story.querySelector('.story__btn--prev');
    const nextBtn = story.querySelector('.story__btn--next');
    const stage = story.querySelector('.story__stage');
    const total = navItems.length;
    if (totalLabel) totalLabel.textContent = String(total).padStart(2, '0');

    const updateRail = (idx) => {
      if (!rail || !railProgress || !navItems.length) return;
      const railRect = rail.getBoundingClientRect();
      const dotEl = navItems[idx].querySelector('.story__nav-dot');
      if (!dotEl) return;
      const dotRect = dotEl.getBoundingClientRect();
      const dotCenter = dotRect.top + dotRect.height / 2;
      const fromTop = Math.max(0, dotCenter - railRect.top);
      railProgress.style.height = `${fromTop}px`;
    };

    const activate = (idx, scroll = false) => {
      idx = Math.max(0, Math.min(total - 1, idx));
      navItems.forEach((c, i) => {
        c.classList.toggle('is-active', i === idx);
        c.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      chapters.forEach((p, i) => {
        p.classList.toggle('is-active', i === idx);
        p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      if (progressLabel) progressLabel.textContent = String(idx + 1).padStart(2, '0');
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === total - 1;
      story.dataset.activeIndex = String(idx);
      // Update rail after layout settles
      requestAnimationFrame(() => updateRail(idx));
      if (scroll && stage && window.matchMedia('(max-width: 1000px)').matches) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('resize', () => {
      const idx = parseInt(story.dataset.activeIndex || '0', 10);
      updateRail(idx);
    });

    navItems.forEach((chap, i) => {
      chap.setAttribute('role', 'tab');
      chap.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      chap.addEventListener('click', () => activate(i, true));
      chap.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (i + 1) % total;
          navItems[next].focus(); activate(next);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (i - 1 + total) % total;
          navItems[prev].focus(); activate(prev);
        }
        if (e.key === 'Home') { e.preventDefault(); navItems[0].focus(); activate(0); }
        if (e.key === 'End') { e.preventDefault(); navItems[total - 1].focus(); activate(total - 1); }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      const idx = parseInt(story.dataset.activeIndex || '0', 10);
      activate(idx - 1);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const idx = parseInt(story.dataset.activeIndex || '0', 10);
      activate(idx + 1);
    });

    activate(0);
  }

  /* ------------------------------------------------------------
     CONTACT FORM — basic demo handler
     ------------------------------------------------------------ */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      if (status) {
        status.textContent = 'Vielen Dank für Ihre Nachricht – ich melde mich innerhalb von 24 Stunden bei Ihnen.';
        status.style.color = 'var(--green)';
        status.style.fontWeight = '500';
      }
      form.reset();
    });

    // Pre-fill betreff from URL parameter
    const params = new URLSearchParams(window.location.search);
    const betreff = params.get('betreff');
    if (betreff) {
      const select = document.getElementById('betreff');
      if (select) {
        const match = Array.from(select.options).find(opt => opt.value === betreff);
        if (match) select.value = betreff;
      }
    }
  }
})();
