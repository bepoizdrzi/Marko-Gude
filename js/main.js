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
   GALLERIJA
   ───────────────────────────────────────── */
const GALLERY_COUNT = 24;
const galleryImages = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    src: `images/gallery/gallery-${num}.jpg`,
    alt: `Vinarija Mimica – fotografija ${i + 1}`,
  };
});

const lightbox        = document.getElementById('galleryLightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const galleryStageImg   = document.getElementById('galleryStageImg');
const galleryStageMeta  = document.getElementById('galleryStageMeta');
const galleryStagePrev  = document.getElementById('galleryStagePrev');
const galleryStageNext  = document.getElementById('galleryStageNext');
const galleryStageOpen  = document.getElementById('galleryStageOpen');
const galleryThumbs     = document.getElementById('galleryThumbs');
const galleryMobileTrack = document.getElementById('galleryMobileTrack');
const galleryScroll     = document.querySelector('.gallery__scroll--mobile');

let galleryIndex = 0;
let galleryDragStart = 0;
let galleryDragDist = 0;
let lightboxTouchStart = 0;

function setGalleryIndex(index) {
  galleryIndex = index;
  const img = galleryImages[galleryIndex];

  if (galleryStageImg) {
    galleryStageImg.src = img.src;
    galleryStageImg.alt = img.alt;
  }
  if (galleryStageMeta) {
    galleryStageMeta.textContent = `${galleryIndex + 1} / ${GALLERY_COUNT}`;
  }
  galleryThumbs?.querySelectorAll('.gallery__thumb').forEach((btn, i) => {
    btn.classList.toggle('is-active', i === galleryIndex);
  });
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

function initGallery() {
  if (galleryThumbs) {
    galleryThumbs.innerHTML = galleryImages.map((img, i) => `
      <button type="button" class="gallery__thumb${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Fotografija ${i + 1}">
        <img src="${img.src}" alt="" loading="lazy">
      </button>
    `).join('');

    galleryThumbs.addEventListener('click', e => {
      const btn = e.target.closest('.gallery__thumb');
      if (!btn) return;
      setGalleryIndex(Number(btn.dataset.index));
    });
  }

  if (galleryMobileTrack) {
    galleryMobileTrack.innerHTML = galleryImages.map((img, i) => `
      <figure class="gallery__item">
        <button type="button" class="gallery__open" data-index="${i}" aria-label="Otvori fotografiju ${i + 1}">
          <img src="${img.src}" alt="${img.alt}" loading="lazy">
        </button>
      </figure>
    `).join('');
    bindGalleryOpens();
  }

  galleryStagePrev?.addEventListener('click', () => stepGallery(-1));
  galleryStageNext?.addEventListener('click', () => stepGallery(1));
  galleryStageOpen?.addEventListener('click', () => showLightbox(galleryIndex));

  setGalleryIndex(0);
}

if (lightbox) {
  initGallery();

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

if (galleryScroll) {
  galleryScroll.addEventListener('pointerdown', e => {
    galleryDragStart = e.clientX;
    galleryDragDist = 0;
  });
  galleryScroll.addEventListener('pointermove', e => {
    galleryDragDist = Math.max(galleryDragDist, Math.abs(e.clientX - galleryDragStart));
  });
  galleryScroll.addEventListener('pointerup', () => {
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
