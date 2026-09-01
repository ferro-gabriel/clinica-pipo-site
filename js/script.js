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
  setupAvaliacaoModals();
  setupNavDropdown();
  setupBackToTop();
  setupSmoothScroll();
  setupConveniosCarousel();
  setupLeadForm();
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
    indicado: 'Desenvolvimento da fala, linguagem e comunicação, incluindo comunicação social e pragmática, CAA, apraxia e transtornos dos sons da fala.',
    description: 'Trabalha a comunicação verbal e não verbal, ampliando formas de expressão e compreensão da linguagem no ritmo de cada pessoa.',
    trabalhamos: ['Fala e articulação', 'Linguagem receptiva e expressiva', 'Comunicação alternativa (CAA/PECS)', 'Habilidades de conversação'],
    abordagens: ['ABA', 'PROMPT', 'CAA', 'Denver', 'Musicoterapia'],
  },
  to: {
    name: 'Terapia Ocupacional',
    color: '#7c4dff',
    icon: '#icon-puzzle',
    indicado: 'Desenvolvimento da autonomia, habilidades funcionais e participação, incluindo integração sensorial, coordenação motora, atividades de vida diária e regulação.',
    description: 'Atua no processamento sensorial e na coordenação motora fina, promovendo autonomia nas atividades do dia a dia.',
    trabalhamos: ['Processamento e integração sensorial', 'Coordenação motora fina', 'Atividades de vida diária (vestir-se, higiene)', 'Regulação emocional e controle inibitório'],
    abordagens: ['ABA', 'Integração Sensorial em Ayres', 'Bobath', 'Denver', 'Seletividade Alimentar'],
  },
  psico: {
    name: 'Psicologia',
    color: '#e8368f',
    icon: '#icon-brain',
    indicado: 'Desenvolvimento de habilidades emocionais, comportamentais e sociais, trabalhando autorregulação, interação, flexibilidade, manejo de comportamentos e habilidades adaptativas.',
    description: 'Atua no comportamento e na regulação emocional, desenvolvendo habilidades sociais em contextos reais de convívio.',
    trabalhamos: ['Regulação emocional e manejo de crises', 'Habilidades sociais e brincar com pares', 'Redução de comportamentos desafiadores', 'Fortalecimento do cognitivo e memória processual'],
    abordagens: ['ABA', 'Denver', 'TEACCH', 'TCC', 'Musicoterapia'],
  },
  psicoped: {
    name: 'Psicopedagogia',
    color: '#ffb300',
    icon: '#icon-graduation-cap',
    indicado: 'Desenvolvimento da aprendizagem e habilidades acadêmicas, trabalhando atenção, memória, funções executivas, alfabetização, raciocínio e estratégias para facilitar o aprendizado.',
    description: 'Desenvolve o processo de aprendizagem, fortalecendo atenção e memória e orientando estratégias para o ambiente escolar.',
    trabalhamos: ['Coordenação motora fina', 'Atenção e memória', 'Adaptações pedagógicas', 'Estratégias de estudo e organização'],
    abordagens: ['ABA'],
  },
  psicomot: {
    name: 'Psicomotricidade',
    color: '#3fb96b',
    icon: '#icon-footprints',
    indicado: 'Desenvolvimento da coordenação, equilíbrio, consciência corporal e planejamento motor, favorecendo habilidades motoras, organização corporal e participação nas atividades.',
    description: 'Desenvolve o corpo em movimento: equilíbrio, coordenação e esquema corporal como base para aprendizagem e autonomia.',
    trabalhamos: ['Equilíbrio e coordenação global', 'Esquema e consciência corporal', 'Lateralidade e orientação espacial', 'Planejamento motor para brincadeiras'],
    abordagens: ['Psicomotricidade', 'Fisioterapia'],
  },
  musico: {
    name: 'Musicoterapia',
    color: '#ff6b3d',
    icon: '#icon-music',
    indicado: 'Desenvolvimento de comunicação, interação social, expressão, atenção, regulação emocional e desenvolvimento de habilidades.',
    description: 'Usa ritmo, som e música como ponte de comunicação não-verbal e expressão emocional em um ambiente lúdico e seguro.',
    trabalhamos: ['Comunicação por ritmo e som', 'Expressão e regulação emocional', 'Atenção compartilhada', 'Interação e vínculo terapêutico'],
    abordagens: ['Musicoterapia', 'ABA'],
  },
  fisio: {
    name: 'Fisioterapia',
    color: '#019bef',
    icon: '#icon-dumbbell',
    indicado: 'Desenvolvimento das habilidades motoras e funcionais, trabalhando força, equilíbrio, coordenação, mobilidade, postura e planejamento motor para favorecer maior independência.',
    description: 'Atua na força, equilíbrio e coordenação motora grossa, essenciais para postura, marcha e participação em atividades físicas.',
    trabalhamos: ['Força e tônus muscular', 'Equilíbrio e marcha', 'Coordenação motora grossa', 'Postura e alinhamento corporal'],
    abordagens: ['Neuromotora', 'Visomotora', 'Bobath', 'Psicomotricidade'],
  },
  nutri: {
    name: 'Nutrição',
    color: '#3fb96b',
    icon: '#icon-apple',
    indicado: 'Atua nas dificuldades alimentares, incluindo seletividade alimentar, ampliação do repertório, adequação nutricional e autonomia.',
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

// Abre os pop-ups de "Avaliação TEA" e "Avaliação Neuropsicológica" (seção Avaliações).
function setupAvaliacaoModals() {
  const triggers = document.querySelectorAll('[data-open-modal]');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const overlay = document.getElementById(trigger.dataset.openModal);
    if (!overlay) return;

    const dialog = overlay.querySelector('.modalidade-modal');
    const closeBtn = overlay.querySelector('.modalidade-modal-close');

    function open() {
      overlay.classList.add('is-open');
      document.body.classList.add('modalidade-modal-open');
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('modalidade-modal-open');
    }

    trigger.addEventListener('click', open);
    overlay.addEventListener('click', close);
    dialog.addEventListener('click', (e) => e.stopPropagation());
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  });
}

// Número de WhatsApp de cada unidade — usado no botão que aparece após o envio do formulário.
const UNIDADE_WHATSAPP = {
  Blumenau: '5547999631084',
  Itapema: '5547991069487',
};

// Chave de envio do formulário "Consultar meu plano" (Web3Forms — web3forms.com).
const WEB3FORMS_ACCESS_KEY = '75ca980e-8bbe-4688-9c90-a5c60e9fad6a';

// Popup "Consultar meu plano": envia os dados preenchidos (lead) por e-mail via Web3Forms.
// Ao confirmar o envio, o formulário some e dá lugar a uma tela de sucesso (ocupando o popup
// inteiro) com a mensagem de confirmação e o botão de WhatsApp da unidade escolhida.
function setupLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const fieldsEl = document.getElementById('lead-form-fields');
  const successEl = document.getElementById('lead-success');
  const unidadeSelect = document.getElementById('lead-unidade');
  const whatsappBtn = document.getElementById('lead-whatsapp-btn');
  const submitBtn = document.getElementById('lead-submit-btn');
  const msgEl = document.getElementById('lead-form-msg');
  const errorEl = document.getElementById('lead-form-error');
  const trigger = document.querySelector('[data-open-modal="plano-lead-modal"]');

  // Toda vez que o popup é reaberto, volta a mostrar o formulário em branco
  // (caso a visita anterior tenha terminado na tela de sucesso).
  if (trigger) {
    trigger.addEventListener('click', () => {
      form.reset();
      errorEl.textContent = '';
      fieldsEl.hidden = false;
      successEl.hidden = true;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const dados = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Novo contato pelo site — Consultar meu plano',
      from_name: 'Site Clínica de Autismo Pipo',
      nome: document.getElementById('lead-nome').value.trim(),
      telefone: document.getElementById('lead-telefone').value.trim(),
      email: document.getElementById('lead-email').value.trim(),
      plano: document.getElementById('lead-plano').value,
      unidade: unidadeSelect.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const resp = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(dados),
      });
      const result = await resp.json();

      if (result.success) {
        if (typeof fbq === 'function') fbq('track', 'Lead');

        const numero = UNIDADE_WHATSAPP[dados.unidade];
        const texto = `Olá! Meu nome é ${dados.nome} e gostaria de consultar meu plano de saúde na unidade de ${dados.unidade}.`;
        whatsappBtn.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
        whatsappBtn.querySelector('span').textContent = `Falar agora no WhatsApp · ${dados.unidade}`;

        msgEl.textContent = 'Recebemos seu contato! Em breve falamos com você — ou, se preferir, já chame a gente pelo WhatsApp abaixo.';
        form.reset();
        fieldsEl.hidden = true;
        successEl.hidden = false;
      } else {
        throw new Error(result.message || 'Falha no envio');
      }
    } catch (err) {
      errorEl.textContent = 'Não conseguimos enviar agora. Tente novamente em instantes ou chame direto: (47) 99963-1084 (Blumenau) / (47) 99106-9487 (Itapema).';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
    }
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

// Carrossel de planos e convênios: loop infinito (clona o conjunto completo
// antes e depois do original e reposiciona sem animação ao cruzar as bordas),
// move com clique nas setas ou arrastando, e centraliza o plano Bradesco ao carregar.
function setupConveniosCarousel() {
  const track = document.getElementById('convenios-track');
  if (!track) return;

  const prevBtn = document.querySelector('.convenios-arrow-prev');
  const nextBtn = document.querySelector('.convenios-arrow-next');

  const originalItems = Array.from(track.children);
  const cloneItems = () => originalItems.map((el) => {
    const clone = el.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  });

  const beforeClones = cloneItems();
  const afterClones = cloneItems();
  const beforeFrag = document.createDocumentFragment();
  beforeClones.forEach((el) => beforeFrag.appendChild(el));
  track.insertBefore(beforeFrag, track.firstChild);
  const afterFrag = document.createDocumentFragment();
  afterClones.forEach((el) => afterFrag.appendChild(el));
  track.appendChild(afterFrag);

  function contentLeft(el) {
    const trackRect = track.getBoundingClientRect();
    return el.getBoundingClientRect().left - trackRect.left + track.scrollLeft;
  }

  function jumpBy(delta) {
    const prevBehavior = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    track.scrollLeft += delta;
    requestAnimationFrame(() => { track.style.scrollBehavior = prevBehavior; });
  }

  let normalizeTimer = null;
  function normalizeScroll() {
    const beforeStart = contentLeft(originalItems[0]);
    const afterStart = contentLeft(afterClones[0]);
    const setW = afterStart - beforeStart;
    if (!setW) return;
    if (track.scrollLeft < beforeStart) {
      jumpBy(setW);
    } else if (track.scrollLeft >= afterStart) {
      jumpBy(-setW);
    }
  }
  track.addEventListener('scroll', () => {
    clearTimeout(normalizeTimer);
    normalizeTimer = setTimeout(normalizeScroll, 100);
  });

  function scrollByAmount(direction) {
    const item = track.querySelector('.convenio-item');
    const itemWidth = item ? item.getBoundingClientRect().width : 100;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const amount = (itemWidth + gap) * 3 * direction;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByAmount(-1));
  nextBtn?.addEventListener('click', () => scrollByAmount(1));

  const section = document.querySelector('.convenios-carousel-section');
  const heroBanner = document.querySelector('.hero-banner');
  if (section && heroBanner) {
    const matchHeroBannerHeight = () => {
      section.style.minHeight = `${heroBanner.getBoundingClientRect().height}px`;
    };
    matchHeroBannerHeight();
    window.addEventListener('resize', matchHeroBannerHeight);
  }

  const bradesco = document.getElementById('convenio-bradesco');
  if (bradesco) {
    const centerBradesco = () => {
      const target = bradesco.offsetLeft - track.clientWidth / 2 + bradesco.offsetWidth / 2;
      track.scrollLeft = Math.max(target, 0);
    };
    centerBradesco();
    window.addEventListener('resize', centerBradesco);
  }
}
