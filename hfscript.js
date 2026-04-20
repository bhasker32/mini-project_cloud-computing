/* Beyond Everest — Shell & Interactions
   ====================================== */

/* ── Theme System ──────────────────────── */
const Theme = {
  KEY: 'be-theme',
  get() {
    const stored = localStorage.getItem(this.KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    document.querySelectorAll('.theme-toggle').forEach(b => b.setAttribute('aria-label', label));
  },
  toggle() {
    this.apply(this.get() === 'dark' ? 'light' : 'dark');
  },
  init() {
    this.apply(this.get());
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.KEY)) this.apply(e.matches ? 'dark' : 'light');
    });
  }
};

// Apply theme immediately (before paint)
Theme.init();

/* ── Search System ─────────────────────── */
const PAGES = [
  { title: 'Home', url: 'index.html', desc: 'Discover Nepal', icon: 'fa-home' },
  { title: 'Culture & Traditions', url: 'culture.html', desc: 'Explore Nepali heritage', icon: 'fa-masks-theater' },
  { title: 'Nepali Cuisine', url: 'food.html', desc: 'Traditional food & recipes', icon: 'fa-utensils' },
  { title: 'Festivals', url: 'festivals.html', desc: 'Dashain, Tihar & more', icon: 'fa-calendar' },
  { title: 'Kathmandu', url: 'kathmandu.html', desc: 'Capital city & Durbar Square', icon: 'fa-city' },
  { title: 'Mountains', url: 'mountains.html', desc: 'Everest, Annapurna & peaks', icon: 'fa-mountain' },
  { title: 'Lakes', url: 'lakes.html', desc: 'Phewa, Rara & more', icon: 'fa-water' },
  { title: 'Temples', url: 'temples.html', desc: 'Sacred sites & spirituality', icon: 'fa-place-of-worship' },
  { title: 'UNESCO Heritage', url: 'heritage.html', desc: 'World Heritage Sites', icon: 'fa-landmark' },
  { title: 'Trekking Routes', url: 'trekking.html', desc: 'EBC, Annapurna Circuit & more', icon: 'fa-person-hiking' },
  { title: 'Adventure Sports', url: 'adventure.html', desc: 'Paragliding, rafting, bungee', icon: 'fa-parachute-box' },
  { title: 'Travel Guide', url: 'travel-guide.html', desc: 'Visa, tips & essentials', icon: 'fa-book-open' },
  { title: 'Plan Your Trip', url: 'plan.html', desc: 'Itineraries & booking', icon: 'fa-map' },
  { title: 'Dashain & Tihar', url: 'dashai.html', desc: 'Major Nepali festivals', icon: 'fa-sun' }
];

const Search = {
  overlay: null,
  input: null,
  results: null,

  init() {
    this.overlay = document.querySelector('.search-overlay');
    this.input = this.overlay?.querySelector('input');
    this.results = this.overlay?.querySelector('.search-results');
    if (!this.overlay) return;

    this.input.addEventListener('input', () => this.filter(this.input.value));

    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); this.open(); }
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) this.close();
    });
  },

  open() {
    this.overlay.classList.add('active');
    this.input.value = '';
    this.results.innerHTML = '';
    setTimeout(() => this.input.focus(), 100);
    this.filter('');
  },

  close() {
    this.overlay.classList.remove('active');
    this.input.blur();
  },

  filter(q) {
    const query = q.trim().toLowerCase();
    const basePath = this.getBasePath();
    const matches = query
      ? PAGES.filter(p => p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query))
      : PAGES;

    this.results.innerHTML = matches.slice(0, 8).map(p => `
      <a class="search-result-item" href="${basePath}${p.url}" role="option">
        <span class="r-icon"><i class="fas ${p.icon}"></i></span>
        <span>
          <span class="r-label">${p.title}</span><br>
          <span class="r-desc">${p.desc}</span>
        </span>
      </a>
    `).join('');
  },

  getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/category/culture/')) return '../../';
    if (path.includes('/category/')) return '../';
    return '';
  }
};

/* ── Shell Loader ──────────────────────── */
async function fetchFragment(name) {
  const paths = [name, `../${name}`, `../../${name}`];
  for (const p of paths) {
    try {
      const r = await fetch(p);
      if (r.ok) return r.text();
    } catch (_) {}
  }
  return '';
}

function markActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-center a[href]').forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
}

function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navCenter = document.querySelector('.nav-center');
  if (!hamburger || !navCenter) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navCenter.classList.toggle('active');
  });

  // Mobile dropdown toggle
  if (window.innerWidth <= 860) {
    navCenter.querySelectorAll('.dropdown > a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        link.closest('.dropdown').classList.toggle('open');
      });
    });
  }

  // Close on nav link click
  navCenter.querySelectorAll('a:not(.dropdown > a)').forEach(link => {
    link.addEventListener('click', () => {
      navCenter.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

function initThemeToggle() {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => Theme.toggle());
  });
}

function initSearchTrigger() {
  document.querySelectorAll('.search-trigger').forEach(btn => {
    btn.addEventListener('click', () => Search.open());
  });
}

function initNavScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function initImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.fb) return;
    img.dataset.fb = '1';
    img.addEventListener('error', function handler() {
      if (!this.dataset.tried) {
        this.dataset.tried = '1';
        this.src = 'images/hero.jpg';
      }
      this.removeEventListener('error', handler);
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── Scroll Reveal ─────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* ── Back to Top ───────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top, #back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.classList.toggle('active', show);
    btn.classList.toggle('visible', show);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Generic Tabs ──────────────────────── */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('section, .tabs, .regions, .guidelines, .container');
      if (!group) return;
      const target = btn.dataset.tab || btn.dataset.target;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (target) {
        group.querySelectorAll('.tab-content, .tab-pane, .region-content').forEach(c => {
          c.classList.toggle('active', c.id === target || c.dataset.content === target);
        });
      }
    });
  });
  document.querySelectorAll('.season-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('section, .season-section, .tabs, .container');
      if (!group) return;
      const target = btn.dataset.season || btn.dataset.tab;
      group.querySelectorAll('.season-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (target) {
        group.querySelectorAll('.season-content').forEach(c => {
          c.classList.toggle('active', c.id === target || c.dataset.season === target);
        });
      }
    });
  });
}

/* ── Generic Accordions ─────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (!item) return;
      const isOpen = item.classList.contains('active');
      item.closest('.accordion')?.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        const c = i.querySelector('.accordion-content');
        if (c) c.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
  document.querySelectorAll('.accordion-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      if (!item) return;
      const content = item.querySelector('.accordion-content');
      const isOpen = btn.classList.contains('active');
      btn.classList.toggle('active', !isOpen);
      if (content) content.style.maxHeight = isOpen ? null : content.scrollHeight + 'px';
    });
  });
}

/* ── FAQ ────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      if (!answer) return;
      const isOpen = answer.classList.contains('active');
      q.closest('.faq-container, .faq-section')?.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('active'));
      if (!isOpen) answer.classList.add('active');
    });
  });
  document.querySelectorAll('.itinerary h4').forEach(h => {
    h.addEventListener('click', () => {
      const c = h.nextElementSibling;
      if (c) c.classList.toggle('active');
    });
  });
}

/* ── Checklist Persistence ─────────────── */
function initChecklist() {
  document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
    const key = 'cb-' + (cb.id || (cb.nextElementSibling?.textContent?.trim().slice(0, 30) || Math.random()));
    if (localStorage.getItem(key) === 'true') cb.checked = true;
    cb.addEventListener('change', () => localStorage.setItem(key, String(cb.checked)));
  });
}

/* ── Cost Estimator ─────────────────────── */
function initCostEstimator() {
  const form = document.querySelector('.cost-estimator');
  if (!form) return;
  function updateCost() {
    const days = parseInt(document.getElementById('duration')?.value) || 7;
    const budget = document.getElementById('budget-type')?.value || 'mid';
    const people = parseInt(document.getElementById('travelers')?.value) || 1;
    const rates = { budget: 60, mid: 120, luxury: 250 };
    const total = days * (rates[budget] || 120) * people;
    const el = document.getElementById('cost-estimate');
    if (el) el.textContent = '$' + total.toLocaleString();
  }
  form.addEventListener('change', updateCost);
  form.addEventListener('input', updateCost);
}

/* ── Countdown Timer ────────────────────── */
function initCountdown() {
  if (!document.getElementById('countdown-days')) return;
  const target = new Date('2025-10-02T00:00:00');
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) return;
    const pad = n => String(Math.floor(n)).padStart(2, '0');
    const el = id => document.getElementById(id);
    if (el('countdown-days'))  el('countdown-days').textContent  = pad(diff / 86400000);
    if (el('countdown-hours')) el('countdown-hours').textContent = pad((diff % 86400000) / 3600000);
    if (el('countdown-mins'))  el('countdown-mins').textContent  = pad((diff % 3600000) / 60000);
    if (el('countdown-secs'))  el('countdown-secs').textContent  = pad((diff % 60000) / 1000);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Newsletter Form ────────────────────── */
function initNewsletterForm() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      if (input?.value && btn) {
        btn.textContent = '✓ Subscribed!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Subscribe'; btn.disabled = false; input.value = ''; }, 3000);
      }
    });
  });
}

/* ── Bootstrap ─────────────────────────── */
async function loadShell() {
  const headerEl = document.getElementById('header');
  const footerEl = document.getElementById('footer');

  if (headerEl) {
    headerEl.innerHTML = await fetchFragment('header.html');
    markActiveNav();
    initMobileNav();
    initThemeToggle();
    initSearchTrigger();
    Search.init();
    initNavScroll();
  }
  if (footerEl) {
    footerEl.innerHTML = await fetchFragment('footer.html');
    setFooterYear();
  }

  initImageFallbacks();
  initSmoothScroll();
  initScrollReveal();
  initBackToTop();
  initTabs();
  initAccordions();
  initFAQ();
  initChecklist();
  initCostEstimator();
  initCountdown();
  initNewsletterForm();
}

document.addEventListener('DOMContentLoaded', loadShell);

