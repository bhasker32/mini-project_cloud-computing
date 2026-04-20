/* Beyond Everest — Page Scripts
   ============================== */

/* ── Weather Cards (Open-Meteo, no API key) ── */
async function fetchWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather request failed');
  return (await res.json()).current;
}

function weatherLabel(code) {
  if (code === 0) return 'Clear sky';
  if ([1,2,3].includes(code)) return 'Partly cloudy';
  if ([45,48].includes(code)) return 'Foggy';
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return 'Rainy';
  if ([71,73,75,77,85,86].includes(code)) return 'Snowy';
  if ([95,96,99].includes(code)) return 'Thunderstorm';
  return 'Variable';
}

function weatherEmoji(code) {
  if (code === 0) return '\u2600\uFE0F';
  if ([1,2,3].includes(code)) return '\u26C5';
  if ([45,48].includes(code)) return '\uD83C\uDF2B\uFE0F';
  if ([51,53,55,61,63,65,80,81,82].includes(code)) return '\uD83C\uDF27\uFE0F';
  if ([71,73,75,77,85,86].includes(code)) return '\u2744\uFE0F';
  return '\uD83C\uDF24\uFE0F';
}

async function initWeather() {
  const cities = [
    { id: 'kathmandu-weather', name: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
    { id: 'pokhara-weather',   name: 'Pokhara',   lat: 28.2096, lon: 83.9856 },
    { id: 'lukla-weather',     name: 'Lukla',      lat: 27.6881, lon: 86.7314 }
  ];

  await Promise.allSettled(cities.map(async city => {
    const el = document.querySelector(`#${city.id} .weather-info`);
    if (!el) return;
    try {
      const data = await fetchWeather(city);
      const temp = Math.round(data.temperature_2m);
      const label = weatherLabel(data.weather_code);
      const emoji = weatherEmoji(data.weather_code);
      el.innerHTML = `<span class="temp">${temp}\u00B0C</span> ${emoji} ${label}`;
    } catch {
      el.textContent = 'Unavailable';
    }
  }));
}

/* ── Hero Animation ─────────────────────── */
function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  requestAnimationFrame(() => hero.classList.add('loaded'));
}

/* ── Newsletter Form ────────────────────── */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    const originalText = btn.textContent;
    btn.textContent = 'Subscribed!';
    btn.disabled = true;
    input.disabled = true;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      input.disabled = false;
      input.value = '';
    }, 3000);
  });
}

/* ── Intersection Observer for Animations ── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.feature-card, .category-card, .testimonial-card, .guide-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s cubic-bezier(.16,1,.3,1), transform 0.5s cubic-bezier(.16,1,.3,1)';
    observer.observe(el);
  });
}

// Apply reveal
document.addEventListener('DOMContentLoaded', () => {
  // Give shell time to load then observe
  setTimeout(() => {
    document.querySelectorAll('.revealed').forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
    });
  }, 100);
});

// Reveal class handler
const style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

/* ── Init ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initWeather();
  initNewsletter();
  setTimeout(initScrollReveal, 300);
});
