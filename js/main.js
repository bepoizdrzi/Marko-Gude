/* ============================================================
   VINARIJA MIMICA – main.js
   ============================================================ */

/* ─────────────────────────────────────────
   KONFIGURACIJA
   Zamijenite URL s pravom adresom webshopa.
   ───────────────────────────────────────── */
const WEBSHOP_URL = 'https://YOUR-WEBSHOP-URL.hr';


/* ─────────────────────────────────────────
   WEBSHOP LINKOVI
   Svi elementi s klasom .js-shop-link
   automatski dobivaju pravi webshop URL.
   ───────────────────────────────────────── */
document.querySelectorAll('.js-shop-link').forEach(el => {
  el.href = WEBSHOP_URL;
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener noreferrer');
});


/* ─────────────────────────────────────────
   NAVIGACIJA – scroll stanje
   ───────────────────────────────────────── */
const nav = document.getElementById('nav');

function syncNav() {
  nav.classList.toggle('scrolled', window.scrollY > 56);
}

window.addEventListener('scroll', syncNav, { passive: true });
syncNav();


/* ─────────────────────────────────────────
   NAVIGACIJA – mobilni meni
   ───────────────────────────────────────── */
const burger  = document.getElementById('navBurger');
const navMenu = document.getElementById('navMenu');

function openMenu() {
  navMenu.classList.add('open');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeMenu() : openMenu();
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
});


/* ─────────────────────────────────────────
   SCROLL REVEAL
   IntersectionObserver animira elemente
   s klasom .reveal kada uđu u viewport.
   ───────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.10,
    rootMargin: '0px 0px -48px 0px',
  }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────
   SMOOTH SCROLL – anchor linkovi
   Kompenzira visinu fiksne navigacije.
   ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    ) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────
   AKTIVAN LINK u navigaciji
   Označava koji je odjeljak trenutno vidljiv.
   ───────────────────────────────────────── */
const sections    = document.querySelectorAll('main > section[id]');
const navLinks    = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('nav__link--active', active);
      });
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px',
  }
);

sections.forEach(s => sectionObserver.observe(s));
