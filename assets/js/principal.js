/* ===========================================
   RPP ENGENHARIA – principal.js
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     1. HEADER – Scroll behaviour
  ────────────────────────────────────────── */
  const cabecalho = document.getElementById('cabecalho');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const fecharMenu = document.getElementById('fechar-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      cabecalho.classList.add('scrolled');
    } else {
      cabecalho.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ──────────────────────────────────────────
     2. MOBILE MENU
  ────────────────────────────────────────── */
  function abrirMenu() {
    mobileMenu?.classList.add('open');
    hamburger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function fecharMenuFn() {
    mobileMenu?.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.contains('open') ? fecharMenuFn() : abrirMenu();
  });
  fecharMenu?.addEventListener('click', fecharMenuFn);

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', fecharMenuFn);
  });

  /* ──────────────────────────────────────────
     3. HERO BACKGROUND SCALE
  ────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    requestAnimationFrame(() => heroBg.classList.add('loaded'));
  }

  /* ──────────────────────────────────────────
     4. SCROLL REVEAL (IntersectionObserver)
  ────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay per sibling index
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObs.observe(el));

  /* ──────────────────────────────────────────
     5. FILTER DE PROJETOS
  ────────────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.dataset.filter;
      projectCards.forEach(card => {
        const match = filtro === 'all' || card.dataset.category === filtro;
        card.style.transition = 'opacity 0.35s, transform 0.35s';
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 350);
        }
      });
    });
  });

  /* ──────────────────────────────────────────
     6. NOTÍCIAS – CRUD + Carrossel
  ────────────────────────────────────────── */
  const STORAGE_KEY   = 'rpp_publicacoes';
  const ADMIN_PASS    = 'rpp2026';
  const CARDS_POR_PAG = getCardsPerPage();

  function getCardsPerPage() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  const noticiasTrack = document.getElementById('noticias-track');
  const slideAtualEl  = document.getElementById('slide-atual');
  const slideTotalEl  = document.getElementById('slide-total');
  const btnPrev       = document.getElementById('noticias-prev');
  const btnNext       = document.getElementById('noticias-next');

  if (!noticiasTrack) return;

  // ── Publicações padrão ──
  const publicacoesDefault = [
    {
      id: crypto.randomUUID(),
      titulo: 'Conclusão da Ponte Industrial Norte',
      resumo: 'A RPP concluiu mais uma ponte estratégica com 1,8 km e soluções de segurança sísmica de referência internacional.',
      categoria: 'Infraestrutura',
      imagem: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
      data: '2026-02-12'
    },
    {
      id: crypto.randomUUID(),
      titulo: 'Novo Centro Logístico em Luanda',
      resumo: 'Projeto de 35.000 m² com eficiência energética de última geração, automação inteligente e redução de custos operacionais.',
      categoria: 'Edificação',
      imagem: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      data: '2026-01-25'
    },
    {
      id: crypto.randomUUID(),
      titulo: 'Programa de Construção Sustentável',
      resumo: 'Nova iniciativa da RPP com metas ambientais concretas: redução de emissões em 40% nas próximas obras da empresa.',
      categoria: 'Sustentabilidade',
      imagem: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
      data: '2026-01-10'
    }
  ];

  // ── Storage helpers ──
  const carregarPublicacoes = () => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (!guardado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(publicacoesDefault));
        return [...publicacoesDefault];
      }
      const parsed = JSON.parse(guardado);
      return Array.isArray(parsed) && parsed.length ? parsed : [...publicacoesDefault];
    } catch { return [...publicacoesDefault]; }
  };

  const guardarPublicacoes = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(publicacoes)); } catch {}
  };

  const formatarData = (valor) => {
    if (!valor) return '';
    try {
      return new Date(valor).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return valor; }
  };

  let publicacoes = carregarPublicacoes();
  let paginaAtual = 0;

  // ── Render carousel ──
  const renderCarousel = () => {
    const cpp = getCardsPerPage();
    const totalPaginas = Math.max(1, Math.ceil(publicacoes.length / cpp));
    if (paginaAtual >= totalPaginas) paginaAtual = 0;

    if (!publicacoes.length) {
      noticiasTrack.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#9ca3af;">
          <i class="fa-solid fa-newspaper" style="font-size:36px; margin-bottom:12px; display:block;"></i>
          Sem publicações no momento.
        </div>`;
      if (slideAtualEl) slideAtualEl.textContent = '0';
      if (slideTotalEl) slideTotalEl.textContent = '0';
      return;
    }

    const inicio = paginaAtual * cpp;
    const slice  = publicacoes.slice(inicio, inicio + cpp);

    noticiasTrack.style.opacity = '0';
    noticiasTrack.style.transform = 'translateY(10px)';

    setTimeout(() => {
      noticiasTrack.innerHTML = slice.map(item => `
        <article class="noticia-card">
          <img src="${item.imagem}" alt="${item.titulo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=60'">
          <div class="noticia-conteudo">
            <span class="noticia-meta">${item.categoria}${item.data ? ' · ' + formatarData(item.data) : ''}</span>
            <h3>${item.titulo}</h3>
            <p>${item.resumo}</p>
          </div>
        </article>
      `).join('');

      noticiasTrack.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      noticiasTrack.style.opacity = '1';
      noticiasTrack.style.transform = '';

      if (slideAtualEl) slideAtualEl.textContent = String(paginaAtual + 1);
      if (slideTotalEl) slideTotalEl.textContent = String(totalPaginas);
    }, 200);
  };

  btnPrev?.addEventListener('click', () => {
    const cpp = getCardsPerPage();
    const total = Math.ceil(publicacoes.length / cpp);
    paginaAtual = (paginaAtual - 1 + total) % total;
    renderCarousel();
  });

  btnNext?.addEventListener('click', () => {
    const cpp = getCardsPerPage();
    const total = Math.ceil(publicacoes.length / cpp);
    paginaAtual = (paginaAtual + 1) % total;
    renderCarousel();
  });

  // Auto-advance
  let autoPlay = setInterval(() => {
    const cpp = getCardsPerPage();
    const total = Math.ceil(publicacoes.length / cpp);
    paginaAtual = (paginaAtual + 1) % total;
    renderCarousel();
  }, 6000);

  [btnPrev, btnNext].forEach(btn => {
    btn?.addEventListener('click', () => {
      clearInterval(autoPlay);
      autoPlay = setInterval(() => {
        const cpp = getCardsPerPage();
        const total = Math.ceil(publicacoes.length / cpp);
        paginaAtual = (paginaAtual + 1) % total;
        renderCarousel();
      }, 6000);
    });
  });

  // Recalcular em resize
  window.addEventListener('resize', renderCarousel, { passive: true });

  renderCarousel();

  /* ──────────────────────────────────────────
     7. ADMIN PANEL
  ────────────────────────────────────────── */
  const loginForm     = document.getElementById('admin-login-form');
  const loginSenha    = document.getElementById('admin-password');
  const loginErro     = document.getElementById('admin-login-error');
  const adminPanel    = document.getElementById('admin-panel');
  const sairAdmin     = document.getElementById('admin-logout');
  const formPublicacao = document.getElementById('publicacao-form');
  const inputId       = document.getElementById('publicacao-id');
  const inputTitulo   = document.getElementById('publicacao-titulo');
  const inputResumo   = document.getElementById('publicacao-resumo');
  const inputCategoria = document.getElementById('publicacao-categoria');
  const inputImagem   = document.getElementById('publicacao-imagem');
  const btnCancelar   = document.getElementById('cancelar-edicao');
  const listaEl       = document.getElementById('lista-publicacoes');

  const limparForm = () => {
    formPublicacao?.reset();
    if (inputId)    inputId.value = '';
    if (btnCancelar) btnCancelar.classList.add('hidden');
    const titulo = formPublicacao?.querySelector('h4');
    if (titulo) titulo.textContent = 'Nova Publicação';
  };

  const renderLista = () => {
    if (!listaEl) return;
    listaEl.innerHTML = publicacoes.length
      ? publicacoes.map(item => `
          <li class="admin-item">
            <div>
              <strong>${item.titulo}</strong>
              <p>${item.categoria}${item.data ? ' · ' + formatarData(item.data) : ''}</p>
            </div>
            <div class="admin-actions">
              <button type="button" data-editar="${item.id}"><i class="fa-solid fa-pen text-xs mr-1"></i> Editar</button>
              <button type="button" data-apagar="${item.id}" class="danger"><i class="fa-solid fa-trash text-xs mr-1"></i> Apagar</button>
            </div>
          </li>`)
        .join('')
      : '<li class="text-sm text-gray-400 p-3">Nenhuma publicação cadastrada.</li>';
  };

  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (loginSenha?.value.trim() === ADMIN_PASS) {
      adminPanel?.classList.remove('hidden');
      loginForm.classList.add('hidden');
      if (loginErro) loginErro.textContent = '';
      if (loginSenha) loginSenha.value = '';
      renderLista();
    } else if (loginErro) {
      loginErro.textContent = 'Senha incorreta. Tente novamente.';
    }
  });

  sairAdmin?.addEventListener('click', () => {
    adminPanel?.classList.add('hidden');
    loginForm?.classList.remove('hidden');
    limparForm();
  });

  btnCancelar?.addEventListener('click', limparForm);

  const lerImagemBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(new Error('Erro ao ler imagem.'));
    r.readAsDataURL(file);
  });

  formPublicacao?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = formPublicacao.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> A guardar...';

    try {
      const idEdicao = inputId?.value;
      const titulo   = inputTitulo?.value.trim();
      const resumo   = inputResumo?.value.trim();
      const categoria = inputCategoria?.value;
      const file     = inputImagem?.files?.[0];

      let imagemFinal = idEdicao
        ? (publicacoes.find(p => p.id === idEdicao)?.imagem || '')
        : '';

      if (file) imagemFinal = await lerImagemBase64(file);
      if (!imagemFinal) { alert('Por favor escolha uma imagem.'); return; }

      if (idEdicao) {
        publicacoes = publicacoes.map(p =>
          p.id === idEdicao ? { ...p, titulo, resumo, categoria, imagem: imagemFinal } : p
        );
      } else {
        publicacoes.unshift({
          id: crypto.randomUUID(),
          titulo, resumo, categoria, imagem: imagemFinal,
          data: new Date().toISOString().slice(0, 10)
        });
      }

      guardarPublicacoes();
      paginaAtual = 0;
      renderCarousel();
      renderLista();
      limparForm();
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Guardar publicação';
    }
  });

  listaEl?.addEventListener('click', e => {
    const btnEditar = e.target.closest('[data-editar]');
    const btnApagar = e.target.closest('[data-apagar]');

    if (btnEditar) {
      const item = publicacoes.find(p => p.id === btnEditar.dataset.editar);
      if (!item) return;
      if (inputId)       inputId.value = item.id;
      if (inputTitulo)   inputTitulo.value = item.titulo;
      if (inputResumo)   inputResumo.value = item.resumo;
      if (inputCategoria) inputCategoria.value = item.categoria;
      if (btnCancelar)   btnCancelar.classList.remove('hidden');
      const titulo = formPublicacao?.querySelector('h4');
      if (titulo) titulo.textContent = 'Editar Publicação';
      formPublicacao?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (btnApagar) {
      if (!confirm('Tem a certeza que deseja eliminar esta publicação?')) return;
      publicacoes = publicacoes.filter(p => p.id !== btnApagar.dataset.apagar);
      guardarPublicacoes();
      paginaAtual = 0;
      renderCarousel();
      renderLista();
      limparForm();
    }
  });

  /* ──────────────────────────────────────────
     8. ACTIVE NAV LINK (IntersectionObserver)
  ────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id], div[id="inicio"]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--ouro)';
          }
          
        });
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

});