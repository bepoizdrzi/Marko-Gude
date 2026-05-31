/* ============================================================
   VINARIJA MIMICA – main.js
   ============================================================ */

/* ─────────────────────────────────────────
   KONFIGURACIJA
   Zamijenite URL s pravom adresom webshopa.
   ───────────────────────────────────────── */
const WEBSHOP_URL = 'https://www.wineandmore.com/b2b-shop/?store_id=47217&store_key=eZzXFle5WWgUq2LF5My2RDEI&ved=2ahUKEwiUw4mGpNSUAxWzX_EDHeFIJIoQgU96BAgfEAM';


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
   HERO – background video
   ───────────────────────────────────────── */
(function () {
  var v = document.querySelector('.hero__video');
  if (!v) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) { v.pause(); v.removeAttribute('autoplay'); return; }

  v.muted = true;
  v.setAttribute('muted', '');
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.loop = true;

  var CUT_END = 1.2;
  var playing = false;

  function show() { v.classList.add('is-playing'); }

  function ensurePlaying() {
    if (playing) return;
    var p = v.play();
    if (p && typeof p.then === 'function') {
      p.then(function () { playing = true; show(); })
       .catch(function () { playing = false; });
    }
  }

  v.addEventListener('playing', function () { playing = true; show(); });
  v.addEventListener('pause', function () { playing = false; });

  v.addEventListener('loadeddata', function () { show(); ensurePlaying(); });
  if (v.readyState >= 2) show();
  ensurePlaying();

  ['touchstart', 'click', 'scroll'].forEach(function (evt) {
    document.addEventListener(evt, ensurePlaying, { once: true, passive: true });
  });

  v.addEventListener('timeupdate', function () {
    if (v.duration && v.currentTime >= v.duration - CUT_END) {
      v.currentTime = 0;
    }
  });

  v.addEventListener('ended', function () {
    v.currentTime = 0;
    playing = false;
    ensurePlaying();
  });

  setInterval(function () {
    if (!playing && !document.hidden) ensurePlaying();
  }, 1000);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { playing = false; ensurePlaying(); }
  });
})();


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
const navTools = document.querySelector('.nav__tools');
const mobileNavMq = window.matchMedia('(max-width: 900px)');

function syncNavMenuPlacement() {
  if (!navMenu || !navTools) return;
  if (mobileNavMq.matches) {
    if (navMenu.parentElement !== document.body) document.body.appendChild(navMenu);
  } else {
    if (navMenu.parentElement !== navTools) navTools.appendChild(navMenu);
    navMenu.classList.remove('open');
    navMenu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
}

syncNavMenuPlacement();
mobileNavMq.addEventListener('change', syncNavMenuPlacement);

function openMenu() {
  syncNavMenuPlacement();
  nav.classList.add('menu-open');
  navMenu.classList.add('open');
  navMenu.setAttribute('aria-hidden', 'false');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  nav.classList.remove('menu-open');
  navMenu.classList.remove('open');
  navMenu.setAttribute('aria-hidden', 'true');
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
   GALLERIJA
   ───────────────────────────────────────── */
const GALLERY_COUNT = 24;

function galleryPhotoAlt(index) {
  const n = index + 1;
  if (window.i18n) {
    return `${window.i18n.t('gallery.photo')} ${n}`;
  }
  return `Vinarija Mimica – fotografija ${n}`;
}

function galleryOpenLabel(index) {
  const n = index + 1;
  if (window.i18n) {
    return `${window.i18n.t('gallery.openN')} ${n}`;
  }
  return `Otvori fotografiju ${n}`;
}

const galleryImages = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    src: `images/gallery/gallery-${num}.jpg`,
    get alt() { return galleryPhotoAlt(i); },
  };
});

const lightbox        = document.getElementById('galleryLightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const galleryMobileTrack = document.getElementById('galleryMobileTrack');
const galleryStrip    = document.getElementById('galleryStrip');

let galleryIndex = 0;
let galleryDragStart = 0;
let galleryDragDist = 0;
let lightboxTouchStart = 0;

function setGalleryIndex(index) {
  galleryIndex = index;
}

function stepGallery(dir) {
  setGalleryIndex((galleryIndex + dir + GALLERY_COUNT) % GALLERY_COUNT);
}

function showLightbox(index) {
  setGalleryIndex(index);
  const img = galleryImages[galleryIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCounter.textContent = `${galleryIndex + 1} / ${GALLERY_COUNT}`;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  if (!navMenu.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function stepLightbox(dir) {
  stepGallery(dir);
  const img = galleryImages[galleryIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCounter.textContent = `${galleryIndex + 1} / ${GALLERY_COUNT}`;
}

function bindGalleryOpens() {
  document.querySelectorAll('.gallery__open').forEach(btn => {
    btn.addEventListener('click', e => {
      if (galleryDragDist > 8) {
        e.preventDefault();
        return;
      }
      showLightbox(Number(btn.dataset.index));
    });
  });
}

function buildGalleryDom() {
  if (galleryMobileTrack) {
    galleryMobileTrack.innerHTML = galleryImages.map((img, i) => `
      <figure class="gallery__item">
        <button type="button" class="gallery__open" data-index="${i}" aria-label="${galleryOpenLabel(i)}">
          <img src="${img.src}" alt="${img.alt}" loading="lazy">
        </button>
      </figure>
    `).join('');
    bindGalleryOpens();
  }
}

function initGallery() {
  buildGalleryDom();
}

function refreshGalleryLanguage() {
  if (!galleryMobileTrack) return;
  buildGalleryDom();
}

if (lightbox) {
  initGallery();

  document.addEventListener('languagechange', () => {
    refreshGalleryLanguage();
    if (!lightbox.hidden) {
      const img = galleryImages[galleryIndex];
      lightboxImg.alt = img.alt;
    }
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => stepLightbox(-1));
  lightboxNext.addEventListener('click', () => stepLightbox(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener('touchstart', e => {
    lightboxTouchStart = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - lightboxTouchStart;
    if (Math.abs(diff) < 40) return;
    stepLightbox(diff > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
}

if (galleryStrip) {
  galleryStrip.addEventListener('pointerdown', e => {
    galleryDragStart = e.clientX;
    galleryDragDist = 0;
  });
  galleryStrip.addEventListener('pointermove', e => {
    galleryDragDist = Math.max(galleryDragDist, Math.abs(e.clientX - galleryDragStart));
  });
  galleryStrip.addEventListener('pointerup', () => {
    setTimeout(() => { galleryDragDist = 0; }, 0);
  });
}


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
    threshold: 0,
    rootMargin: '0px 0px 0px 0px',
  }
);

function revealInView() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    const visiblePx = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visiblePx > 0) {
      el.classList.add('visible');
      revealObserver.unobserve(el);
    }
  });
}

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
revealInView();
window.addEventListener('load', revealInView);
window.addEventListener('scroll', revealInView, { passive: true });


/* ─────────────────────────────────────────
   SECTION FLOW – wine-like ulaz (#o-nama, #ture)
   ───────────────────────────────────────── */
document.documentElement.classList.add('flow-enabled');

const flowSections = document.querySelectorAll('#o-nama, #ture');
const flowObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview');
      flowObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  }
);

function flowInView() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  flowSections.forEach(section => {
    if (section.classList.contains('is-inview')) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < vh * 0.88 && rect.bottom > 0) {
      section.classList.add('is-inview');
      flowObserver.unobserve(section);
    }
  });
}

flowSections.forEach(section => flowObserver.observe(section));
flowInView();
window.addEventListener('load', flowInView);
window.addEventListener('scroll', flowInView, { passive: true });


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


/* ─────────────────────────────────────────
   TOUR CARDS – synced image carousels
   ───────────────────────────────────────── */
const TOUR_CAROUSEL_INTERVAL_MS = 5000;

function createTourCarousel(root) {
  const slides = root.querySelectorAll('.tcard__slide');
  const dots   = root.querySelectorAll('.tcard__carousel-dot');
  const prevBtn = root.querySelector('.tcard__carousel-btn--prev');
  const nextBtn = root.querySelector('.tcard__carousel-btn--next');
  const total = slides.length;

  function dotLabel(i) {
    return `${i + 1} / ${total}`;
  }

  function goTo(step) {
    const index = ((step % total) + total) % total;
    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === index));
    dots.forEach((dot, n) => {
      const active = n === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
      dot.setAttribute('aria-label', dotLabel(n));
    });
    return index;
  }

  return { root, total, prevBtn, nextBtn, dots, goTo };
}

function initSyncedTourCarousels() {
  const roots = ['#tourGastroCarousel', '#tourOutdoorCarousel']
    .map(id => document.querySelector(id))
    .filter(Boolean);

  if (!roots.length) return;

  const carousels = roots.map(createTourCarousel);
  let masterStep = 0;
  let timer = null;
  let pauseDepth = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyStep(step) {
    masterStep = step;
    carousels.forEach(c => c.goTo(step));
  }

  function advance(dir) {
    applyStep(masterStep + dir);
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAuto() {
    if (reducedMotion || pauseDepth > 0) return;
    stopAuto();
    timer = setInterval(() => advance(1), TOUR_CAROUSEL_INTERVAL_MS);
  }

  function pause() {
    pauseDepth += 1;
    stopAuto();
  }

  function resume() {
    pauseDepth = Math.max(0, pauseDepth - 1);
    if (pauseDepth === 0) startAuto();
  }

  function onInteract(dir) {
    advance(dir);
    stopAuto();
    startAuto();
  }

  function onDot(step) {
    applyStep(step);
    stopAuto();
    startAuto();
  }

  carousels.forEach(({ root, prevBtn, nextBtn, dots }) => {
    prevBtn.addEventListener('click', () => onInteract(-1));
    nextBtn.addEventListener('click', () => onInteract(1));

    dots.forEach(dot => {
      dot.addEventListener('click', () => onDot(Number(dot.dataset.slide)));
    });

    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onInteract(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onInteract(1);
      }
    });

    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', e => {
      if (!root.contains(e.relatedTarget)) resume();
    });
  });

  applyStep(0);
  startAuto();
}

initSyncedTourCarousels();
