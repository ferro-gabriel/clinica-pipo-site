// Clínica de Autismo Pipo — interações da página
// Substitui o que antes era feito em React: animações ao rolar (Reveal),
// números que sobem (CountUp), acordeão de perguntas frequentes (FAQ)
// e o ano automático no rodapé.

document.addEventListener('DOMContentLoaded', () => {
  setFooterYear();
  setupRevealAnimations();
  setupCountUp();
  setupFaqAccordion();
  setupModalidadesModal();
  setupNavDropdown();
  setupBackToTop();
  setupSmoothScroll();
});

// Deixa a rolagem do mouse mais suave (Lenis). Toque continua com a rolagem
// nativa do celular — só o scroll de roda/trackpad no desktop é suavizado.
function setupSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Elementos com rolagem própria (menu mobile, modal) não devem ser controlados pelo Lenis.
  document.querySelectorAll('.mobile-menu-overlay, .modalidade-modal, .nav-dropdown-panel').forEach((el) => {
    el.setAttribute('data-lenis-prevent', '');
  });

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Faz os links para #ancora da própria página rolarem suavemente, considerando o header fixo.
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
    });
  });
}

// Mostra o botão "voltar ao topo" depois de rolar a página, e rola suavemente ao clicar.
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggle = () => btn.classList.toggle('is-visible', window.scrollY > 600);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

function setFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

// Anima elementos com a classe "reveal" quando entram na tela.
function setupRevealAnimations() {
  const items = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '-60px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

// Sobe os números da seção "Prova social" quando ficam visíveis.
function setupCountUp() {
  const nodes = document.querySelectorAll('.count-up');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  nodes.forEach((node) => {
    const target = Number(node.dataset.value) || 0;
    const decimals = Number(node.dataset.decimals) || 0;
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    const duration = 1600;

    const format = (value) =>
      prefix + value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      node.textContent = format(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          node.textContent = format(target * easeOutCubic(progress));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
  });
}

// Dados do modal de cada modalidade terapêutica (seção "8 modalidades").
const MODALIDADES_DATA = {
  fono: {
    name: 'Fonoaudiologia',
    color: '#019bef',
    icon: '#icon-ear',
    indicado: 'Crianças, adolescentes e adultos com atraso ou alteração de fala e linguagem.',
    description: 'Trabalha a comunicação verbal e não verbal, ampliando formas de expressão e compreensão da linguagem no ritmo de cada pessoa.',
    trabalhamos: ['Fala e articulação', 'Linguagem receptiva e expressiva', 'Comunicação alternativa (CAA/PECS)', 'Habilidades de conversação'],
    abordagens: ['ABA', 'PROMPT', 'CAA'],
  },
  to: {
    name: 'Terapia Ocupacional',
    color: '#7c4dff',
    icon: '#icon-puzzle',
    indicado: 'Pessoas com dificuldades sensoriais, motoras ou de independência nas rotinas.',
    description: 'Atua no processamento sensorial e na coordenação motora fina, promovendo autonomia nas atividades do dia a dia.',
    trabalhamos: ['Processamento e integração sensorial', 'Coordenação motora fina', 'Atividades de vida diária (vestir-se, higiene)', 'Regulação para brincar e aprender'],
    abordagens: ['ABA', 'Integração Sensorial (Ayres)'],
  },
  psico: {
    name: 'Psicologia',
    color: '#e8368f',
    icon: '#icon-brain',
    indicado: 'Pessoas com desafios de comportamento, regulação emocional ou interação social.',
    description: 'Foca no comportamento e na regulação emocional, desenvolvendo habilidades sociais em contextos reais de convívio.',
    trabalhamos: ['Regulação emocional e manejo de crises', 'Habilidades sociais e brincar com pares', 'Redução de comportamentos desafiadores', 'Fortalecimento da autoestima'],
    abordagens: ['ABA', 'TCC'],
  },
  psicoped: {
    name: 'Psicopedagogia',
    color: '#ffb300',
    icon: '#icon-graduation-cap',
    indicado: 'Crianças com dificuldades de aprendizagem, atenção ou adaptação escolar.',
    description: 'Cuida do processo de aprendizagem, fortalecendo atenção e memória e orientando estratégias para o ambiente escolar.',
    trabalhamos: ['Atenção e memória', 'Estratégias de estudo e organização', 'Adaptações pedagógicas', 'Ponte com professores e AEE'],
    abordagens: ['ABA'],
  },
  psicomot: {
    name: 'Psicomotricidade',
    color: '#3fb96b',
    icon: '#icon-footprints',
    indicado: 'Crianças com dificuldades de equilíbrio, coordenação ou noção corporal.',
    description: 'Desenvolve o corpo em movimento: equilíbrio, coordenação e esquema corporal como base para aprendizagem e autonomia.',
    trabalhamos: ['Equilíbrio e coordenação global', 'Esquema e consciência corporal', 'Lateralidade e orientação espacial', 'Planejamento motor para brincadeiras'],
    abordagens: ['Psicomotricidade Relacional'],
  },
  musico: {
    name: 'Musicoterapia',
    color: '#ff6b3d',
    icon: '#icon-music',
    indicado: 'Pessoas com dificuldade de comunicação verbal ou expressão emocional.',
    description: 'Usa ritmo, som e música como ponte de comunicação não-verbal e expressão emocional em um ambiente lúdico e seguro.',
    trabalhamos: ['Comunicação por ritmo e som', 'Expressão e regulação emocional', 'Atenção compartilhada', 'Interação e vínculo terapêutico'],
    abordagens: ['Musicoterapia Improvisacional'],
  },
  fisio: {
    name: 'Fisioterapia',
    color: '#019bef',
    icon: '#icon-dumbbell',
    indicado: 'Pessoas com alterações de tônus, marcha ou coordenação motora grossa.',
    description: 'Atua na força, equilíbrio e coordenação motora grossa, essenciais para postura, marcha e participação em atividades físicas.',
    trabalhamos: ['Força e tônus muscular', 'Equilíbrio e marcha', 'Coordenação motora grossa', 'Postura e alinhamento corporal'],
    abordagens: ['Neuromotora', 'Conceito Bobath'],
  },
  nutri: {
    name: 'Nutrição',
    color: '#3fb96b',
    icon: '#icon-apple',
    indicado: 'Pessoas com seletividade alimentar ou restrições no repertório de alimentos.',
    description: 'Trabalha a seletividade alimentar, ampliando de forma gradual o repertório de alimentos com apoio sensorial e comportamental.',
    trabalhamos: ['Ampliação do repertório alimentar', 'Dessensibilização sensorial a texturas e sabores', 'Rotina e autonomia nas refeições', 'Orientação nutricional à família'],
    abordagens: ['ABA', 'Seletividade Alimentar'],
  },
};
const MODALIDADES_ORDER = ['fono', 'to', 'psico', 'psicoped', 'psicomot', 'musico', 'fisio', 'nutri'];
const MODALIDADES_WHATSAPP = '5547999631084';

// Abre o modal com os detalhes de cada modalidade (foto + ícone + botões viram cards clicáveis).
function setupModalidadesModal() {
  const overlay = document.getElementById('modalidade-modal');
  if (!overlay) return;

  const buttons = document.querySelectorAll('.modalidade-btn');
  const dialog = overlay.querySelector('.modalidade-modal');
  const iconUse = overlay.querySelector('.modalidade-modal-icon use');
  const titleEl = overlay.querySelector('.modalidade-modal-title');
  const indicadoEl = overlay.querySelector('.modalidade-modal-indicado');
  const descEl = overlay.querySelector('.modalidade-modal-desc');
  const listEl = overlay.querySelector('.modalidade-modal-list');
  const tagsEl = overlay.querySelector('.modalidade-modal-tags');
  const headerEl = overlay.querySelector('.modalidade-modal-header');
  const ctaEl = overlay.querySelector('.modalidade-modal-cta');
  const closeBtn = overlay.querySelector('.modalidade-modal-close');
  const prevBtn = overlay.querySelector('.modalidade-modal-prev');
  const nextBtn = overlay.querySelector('.modalidade-modal-next');

  let currentIndex = -1;

  function render(slug) {
    const data = MODALIDADES_DATA[slug];
    if (!data) return;

    headerEl.style.backgroundColor = data.color;
    iconUse.setAttribute('href', data.icon);
    titleEl.textContent = data.name;
    indicadoEl.textContent = data.indicado;
    descEl.textContent = data.description;

    listEl.innerHTML = '';
    data.trabalhamos.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<svg class="icon" width="18" height="18" style="color:${data.color}"><use href="#icon-check"/></svg><span></span>`;
      li.querySelector('span').textContent = item;
      listEl.appendChild(li);
    });

    tagsEl.innerHTML = '';
    data.abordagens.forEach((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    const message = `Olá! Gostaria de saber mais sobre ${data.name}.`;
    ctaEl.href = `https://wa.me/${MODALIDADES_WHATSAPP}?text=${encodeURIComponent(message)}`;
  }

  function open(index) {
    currentIndex = (index + MODALIDADES_ORDER.length) % MODALIDADES_ORDER.length;
    render(MODALIDADES_ORDER[currentIndex]);
    overlay.classList.add('is-open');
    document.body.classList.add('modalidade-modal-open');
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('modalidade-modal-open');
  }

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => open(index));
  });

  overlay.addEventListener('click', close);
  dialog.addEventListener('click', (e) => e.stopPropagation());
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => open(currentIndex - 1));
  nextBtn.addEventListener('click', () => open(currentIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
}

// Fecha o dropdown "Modalidades" do menu (desktop) ao clicar fora ou ao escolher um link.
function setupNavDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  document.addEventListener('click', (e) => {
    dropdowns.forEach((dd) => {
      if (dd.open && !dd.contains(e.target)) dd.removeAttribute('open');
    });
  });

  dropdowns.forEach((dd) => {
    dd.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => dd.removeAttribute('open'));
    });
  });
}

// Abre/fecha as perguntas do FAQ (uma por vez, como no site original).
function setupFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    button.addEventListener('click', () => {
      const wasActive = item.classList.contains('is-active');

      items.forEach((other) => {
        other.classList.remove('is-active');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      if (!wasActive) {
        item.classList.add('is-active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
