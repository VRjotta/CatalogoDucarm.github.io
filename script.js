/* =============================================
   CONFIG — ALTERE AQUI
   ============================================= */

// Troque pelo @ real da sua marca no Instagram
const INSTAGRAM_USER = 'ducarm_house';

// Mensagens personalizadas para cada modelo
// Cada mensagem vai aparecer já preenchida no Direct do cliente
const MENSAGENS = {
  'BLACKOUT': `Oi! Vi a camisa BLACKOUT no catálogo da Ducarm e me interessei. Quais tamanhos ainda têm disponível e qual é o prazo de entrega?`,
  'CONCRETE': `Fala! Quero saber mais sobre a camisa CONCRETE da Ducarm. Tem no meu tamanho? Me passa os detalhes de pagamento e frete também.`,
  'CIPHER':   `Salve! A camisa CIPHER da Ducarm me pegou demais. Quero fechar uma. Quais tamanhos sobraram e como funciona o pagamento?`,
  'SIGNAL':   `Ei! Tô de olho na camisa SIGNAL da Ducarm faz tempo. Tem disponível? Me fala os tamanhos e como faz pra comprar.`,
};

/* =============================================
   CARROSSÉIS — LÓGICA PRINCIPAL
   ============================================= */
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  const id       = parseInt(wrap.dataset.carousel);
  const track    = wrap.querySelector('.carousel-track');
  const slides   = Array.from(track.querySelectorAll('.carousel-slide'));
  const total    = slides.length;
  let current    = 0;
  let startX     = 0;
  let isDragging = false;

  /* --- Cria os dots de navegação --- */
  const dotsWrap = document.querySelector(`.carousel-dots[data-dots="${id}"]`);
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  /* --- Função principal de navegação --- */
  function goTo(index) {
    if (index < 0) index = total - 1; // loop para o último
    if (index >= total) index = 0;    // loop para o primeiro
    current = index;

    const slideWidth = slides[0].offsetWidth + 12; // 12 = gap do CSS
    track.style.transform = `translateX(-${current * slideWidth}px)`;

    // Atualiza dots
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  /* --- Setas de navegação --- */
  wrap.closest('.modelo-block').querySelectorAll('.arrow-btn').forEach(btn => {
    if (parseInt(btn.dataset.carousel) === id) {
      btn.addEventListener('click', () => {
        goTo(current + parseInt(btn.dataset.dir));
      });
    }
  });

  /* --- Swipe para celular (touch) --- */
  track.addEventListener('touchstart', e => {
    startX     = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    isDragging = false;
  }, { passive: true });

  /* --- Arrastar com mouse (desktop) --- */
  track.addEventListener('mousedown', e => {
    startX     = e.clientX;
    isDragging = true;
    track.style.transition = 'none';
  });

  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    track.style.transition = '';
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    isDragging = false;
  });

  /* --- Autoplay (pausa ao passar o mouse) --- */
  let autoplay = setInterval(() => goTo(current + 1), 3500);
  wrap.addEventListener('mouseenter', () => clearInterval(autoplay));
  wrap.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 3500);
  });

  /* --- Recalcula posição se redimensionar a janela --- */
  window.addEventListener('resize', () => goTo(current));
});

/* =============================================
   BOTÕES DE COMPRA — INSTAGRAM DIRECT
   ============================================= */
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const modelo = btn.dataset.modelo;
    const msg    = MENSAGENS[modelo] || `Olá! Vi o catálogo da Ducarm House e gostaria de mais informações sobre os modelos disponíveis.`;
    const url    = `https://ig.me/m/${INSTAGRAM_USER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});

/* =============================================
   SCROLL REVEAL — ANIMAÇÃO AO ROLAR
   ============================================= */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // anima só uma vez
    }
  });
}, { threshold: 0.15 });

/* =============================================
   ESCONDER NAV AO ROLAR
   ============================================= */
const nav = document.querySelector('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;

  if (current > 80 && current > lastScroll) {
    // rolando pra baixo e passou de 80px → esconde
    nav.classList.add('hidden');
  } else {
    // rolando pra cima ou no topo → mostra
    nav.classList.remove('hidden');
  }

  lastScroll = current;
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =============================================
   CURSOR CUSTOMIZADO — só desktop (pointer: fine)
   ============================================= */
if (window.matchMedia('(pointer: fine)').matches) {
  const cursorDot  = document.createElement('div');
  const cursorRing = document.createElement('div');
  cursorDot.className  = 'cursor-dot';
  cursorRing.className = 'cursor-ring';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .btn-buy, .arrow-btn, .dot').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

/* =============================================
   MENU HAMBURGUER — MOBILE
   ============================================= */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navClose  = document.getElementById('navClose');

function openMenu() {
  navToggle.classList.add('open');
  navMobile.classList.add('open');
  document.body.style.overflow = 'hidden'; // trava o scroll enquanto menu aberto
}

function closeMenu() {
  navToggle.classList.remove('open');
  navMobile.classList.remove('open');
  document.body.style.overflow = '';
}

if (navToggle) navToggle.addEventListener('click', openMenu);
if (navClose)  navClose.addEventListener('click', closeMenu);

// Fecha ao clicar em qualquer link do menu
if (navMobile) {
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
