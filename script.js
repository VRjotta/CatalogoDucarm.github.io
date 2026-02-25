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
   UTILITÁRIOS
   ============================================= */

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* =============================================
   CARROSSÉIS — autoplay centralizado
   =============================================
   CORREÇÃO: antes, cada carrossel registrava seu próprio
   visibilitychange listener (4 no total). Ao voltar à aba,
   4 intervalos novos eram criados por carrossel — acumulando
   indefinidamente. Agora há um Map central e 1 listener único.
*/
const autoplayIntervals = new Map();
const AUTOPLAY_MS = 3500;

function startAutoplay(id, fn) {
  stopAutoplay(id);
  autoplayIntervals.set(id, setInterval(fn, AUTOPLAY_MS));
}

function stopAutoplay(id) {
  const existing = autoplayIntervals.get(id);
  if (existing != null) {
    clearInterval(existing);
    autoplayIntervals.delete(id);
  }
}

/* Listener único de visibilitychange para todos os carrosséis */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    autoplayIntervals.forEach((_, id) => stopAutoplay(id));
  }
  /* Retomada: cada wrap faz isso no próprio mouseleave / touchend */
});

document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const id     = parseInt(wrap.dataset.carousel);
  const track  = wrap.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const total  = slides.length;
  let idx      = 0;
  let startX   = 0;
  let startY   = 0;
  let isDragging   = false;
  let isHorizontal = null;

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
    const slideWidth = slides[0].offsetWidth + 12;
    track.style.transform = `translateX(-${idx * slideWidth}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  const advanceFn = () => goTo(idx + 1);

  /* Setas */
  wrap.closest('.modelo-block').querySelectorAll('.arrow-btn').forEach(btn => {
    if (parseInt(btn.dataset.carousel) === id) {
      btn.addEventListener('click', () => goTo(idx + parseInt(btn.dataset.dir)));
    }
  });

  /* ---- Swipe touch ---- */
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    isHorizontal = null;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHorizontal === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontal = Math.abs(dx) > Math.abs(dy);
    }
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging || !isHorizontal) { isDragging = false; return; }
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) goTo(idx + (diff > 0 ? 1 : -1));
    isDragging = false;
    isHorizontal = null;
  }, { passive: true });

  /* ---- Arrastar com mouse (desktop) ----
     CORREÇÃO: mouseup agora usa AbortController para auto-remover
     o listener após o uso, evitando acúmulo no window.
  */
  let dragController = null;

  track.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
    track.style.transition = 'none';

    if (dragController) dragController.abort();
    dragController = new AbortController();

    window.addEventListener('mouseup', e => {
      if (!isDragging) return;
      const diff = startX - e.clientX;
      track.style.transition = '';
      if (Math.abs(diff) > 40) goTo(idx + (diff > 0 ? 1 : -1));
      isDragging = false;
      dragController.abort();
      dragController = null;
    }, { signal: dragController.signal });
  });

  /* ---- Autoplay ---- */
  startAutoplay(id, advanceFn);

  wrap.addEventListener('mouseenter', () => stopAutoplay(id));
  wrap.addEventListener('mouseleave', () => {
    if (!document.hidden) startAutoplay(id, advanceFn);
  });

  wrap.addEventListener('touchstart', () => stopAutoplay(id), { passive: true });
  wrap.addEventListener('touchend', () => {
    if (!document.hidden) startAutoplay(id, advanceFn);
  }, { passive: true });

  window.addEventListener('resize', debounce(() => goTo(idx), 150));
});

/* =============================================
   BOTÕES DE COMPRA — INSTAGRAM DIRECT
   ============================================= */
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const modelo = btn.dataset.modelo;
    const msg = MENSAGENS[modelo] || `Olá! Vi o catálogo da Ducarm e gostaria de mais informações sobre os modelos disponíveis.`;
    const url = `https://ig.me/m/${INSTAGRAM_USER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});

/* =============================================
   CURSOR CUSTOMIZADO (desktop only)
   ============================================= */
const cursor = document.getElementById('cursor');

if (cursor && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('visible'));

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
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =============================================
   NAV — ESCONDER AO ROLAR
   ============================================= */
const nav       = document.querySelector('nav');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 80 && scrollY > lastScrollY) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastScrollY = scrollY;
}, { passive: true });

/* =============================================
   MENU HAMBURGUER — MOBILE
   ============================================= */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navClose  = document.getElementById('navClose');

function openMenu() {
  navToggle.classList.add('open');
  navMobile.classList.add('open');
  document.body.style.overflow = 'hidden';
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
  navMobile.addEventListener('click', e => {
    if (e.target === navMobile) closeMenu();
  });
}
