/* =============================================
   CONFIG — ALTERE AQUI
   ============================================= */

const INSTAGRAM_USER = 'ducarm_house';

const MENSAGENS = {
  'BLACKOUT': `Oi! Vi a camisa BLACKOUT no catálogo da Ducarm e me interessei. Quais tamanhos ainda têm disponível e qual é o prazo de entrega?`,
  'CONCRETE': `Fala! Quero saber mais sobre a camisa CONCRETE da Ducarm. Tem no meu tamanho? Me passa os detalhes de pagamento e frete também.`,
  'CIPHER':   `Salve! A camisa CIPHER da Ducarm me pegou demais. Quero fechar uma. Quais tamanhos sobraram e como funciona o pagamento?`,
  'SIGNAL':   `Ei! Tô de olho na camisa SIGNAL da Ducarm faz tempo. Tem disponível? Me fala os tamanhos e como faz pra comprar.`,
};

/* =============================================
   CARROSSÉIS
   ============================================= */
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const id       = parseInt(wrap.dataset.carousel);
  const track    = wrap.querySelector('.carousel-track');
  const slides   = Array.from(track.querySelectorAll('.carousel-slide'));
  const total    = slides.length;
  let idx        = 0; /* renomeado de 'current' para não conflitar com o scroll listener */
  let startX     = 0;
  let isDragging = false;

  const dotsWrap = document.querySelector(`.carousel-dots[data-dots="${id}"]`);
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    if (index < 0)      index = total - 1;
    if (index >= total) index = 0;
    idx = index;

    const slideWidth = slides[0].offsetWidth + 12; /* 12 = gap do CSS */
    track.style.transform = `translateX(-${idx * slideWidth}px)`;

    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  /* Setas */
  wrap.closest('.modelo-block').querySelectorAll('.arrow-btn').forEach(btn => {
    if (parseInt(btn.dataset.carousel) === id) {
      btn.addEventListener('click', () => goTo(idx + parseInt(btn.dataset.dir)));
    }
  });

  /* Swipe touch */
  track.addEventListener('touchstart', e => {
    startX     = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(idx + (diff > 0 ? 1 : -1));
    isDragging = false;
  }, { passive: true });

  /* Arrastar com mouse */
  track.addEventListener('mousedown', e => {
    startX           = e.clientX;
    isDragging       = true;
    track.style.transition = 'none';
  });

  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    track.style.transition = '';
    if (Math.abs(diff) > 40) goTo(idx + (diff > 0 ? 1 : -1));
    isDragging = false;
  });

  /* Autoplay */
  let autoplay = setInterval(() => goTo(idx + 1), 3500);
  wrap.addEventListener('mouseenter', () => clearInterval(autoplay));
  wrap.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(idx + 1), 3500);
  });

  /* Recalcula no resize */
  window.addEventListener('resize', () => goTo(idx));
});

/* =============================================
   BOTÕES DE COMPRA — INSTAGRAM DIRECT
   ============================================= */
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const modelo = btn.dataset.modelo;
    const msg    = MENSAGENS[modelo] || `Olá! Vi o catálogo da Ducarm e gostaria de mais informações sobre os modelos disponíveis.`;
    const url    = `https://ig.me/m/${INSTAGRAM_USER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});

/* =============================================
   CURSOR CUSTOMIZADO
   ============================================= */
const cursor = document.getElementById('cursor');

if (cursor) {
  document.addEventListener('mousemove', e => {
    /* usa transform para performance — sem reflow */
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('visible'));

  /* Expande em elementos clicáveis */
  document.querySelectorAll('a, button, .dot, .carousel-slide').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =============================================
   NAV — ESCONDER AO ROLAR
   ============================================= */
const nav        = document.querySelector('nav');
let lastScrollY  = 0; /* renomeado — evita conflito com 'current' dos carrosséis */

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 80 && scrollY > lastScrollY) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastScrollY = scrollY;
});

/* =============================================
   MENU HAMBURGUER — MOBILE
   ============================================= */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navClose  = document.getElementById('navClose');

function openMenu() {
  navToggle.classList.add('open');
  navMobile.classList.add('open');
  document.body.style.overflow = 'hidden'; /* trava scroll ao abrir */
}

function closeMenu() {
  navToggle.classList.remove('open');
  navMobile.classList.remove('open');
  document.body.style.overflow = '';
}

if (navToggle) navToggle.addEventListener('click', openMenu);
if (navClose)  navClose.addEventListener('click', closeMenu);

if (navMobile) {
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
