/* Macan Homes — interactions */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('[data-loader]')?.classList.add('is-gone'), 1400);
  });

  /* ---------- Header (scroll-aware, hide on scroll down) ---------- */
  const header = $('[data-header]');
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 40) header.classList.add('is-scrolled'); else header.classList.remove('is-scrolled');
    if (y > 240 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Custom cursor ---------- */
  const cursor = $('[data-cursor]');
  const cursorDot = $('[data-cursor-dot]');
  if (cursor && !reduced && window.matchMedia('(min-width: 901px)').matches) {
    let cx = 0, cy = 0, dx = 0, dy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    const tick = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      dx += (tx - dx) * 0.55; dy += (ty - dy) * 0.55;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    $$('a, button, [data-magnetic], .card-media').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduced) {
    $$('[data-magnetic]').forEach(el => {
      let raf;
      const strength = el.classList.contains('btn-link') ? 0.18 : 0.32;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  /* ---------- Split text wrapper for [data-split] ----------
     We expect markup already in form: <span class="line"><span>...</span></span>
     This just attaches the IntersectionObserver below. */

  /* ---------- Reveal on scroll ---------- */
  const ioRevealTargets = $$('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    ioRevealTargets.forEach(el => io.observe(el));
  } else {
    ioRevealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Parallax (background-position offsets) ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (parallaxEls.length && !reduced) {
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const intensity = parseFloat(el.dataset.parallax) || 0.15;
        const offset = (rect.top + rect.height / 2 - vh / 2) * intensity * -1;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    let p_t = false;
    window.addEventListener('scroll', () => {
      if (!p_t) { requestAnimationFrame(() => { updateParallax(); p_t = false; }); p_t = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Tilt cards ---------- */
  if (!reduced && window.matchMedia('(min-width: 901px)').matches) {
    $$('[data-tilt]').forEach(el => {
      let raf;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1100px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  /* ---------- Stat counters ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cIO.unobserve(e.target);
        const target = parseFloat(e.target.dataset.count);
        const decimals = (e.target.dataset.count.split('.')[1] || '').length;
        const dur = 1800;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = target * eased;
          e.target.textContent = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cIO.observe(el));
  }

  /* ---------- Collection filter ---------- */
  const chips = $$('.chip');
  const cards = $$('.card');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const f = chip.dataset.filter;
      cards.forEach(card => {
        const match = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Testimonial rotator ---------- */
  const quotes = $$('[data-quotes] p');
  const people = $$('.qp');
  const progress = $('[data-progress]');
  if (quotes.length) {
    let i = 0;
    const total = quotes.length;
    const dwell = 6000;
    let pStart = performance.now();
    let raf;

    const setActive = (n) => {
      quotes.forEach((q, k) => q.classList.toggle('is-active', k === n));
      people.forEach((p, k) => p.classList.toggle('is-active', k === n));
      pStart = performance.now();
    };

    const tick = (now) => {
      const t = Math.min(1, (now - pStart) / dwell);
      if (progress) progress.style.width = (t * 100).toFixed(2) + '%';
      if (t >= 1) {
        i = (i + 1) % total;
        setActive(i);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    people.forEach(p => p.addEventListener('click', () => {
      i = parseInt(p.dataset.qi, 10);
      setActive(i);
    }));
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = $('[data-nav-toggle]');
  const nav = $('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      nav.style.display = open ? 'flex' : '';
      if (open) {
        Object.assign(nav.style, {
          position: 'fixed', inset: '0', background: 'var(--paper)',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2rem', fontSize: '1.4rem', zIndex: '90'
        });
      } else {
        nav.removeAttribute('style');
      }
    });
    nav.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        nav.removeAttribute('style');
      }
    });
  }

  /* ---------- Smooth anchor scroll w/ header offset ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
