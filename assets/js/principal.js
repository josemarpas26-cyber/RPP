/* ===========================================
   RPP ENGENHARIA – principal.js
   iOS/Safari FIXED VERSION
   =========================================== */

document.addEventListener('DOMContentLoaded', function() {

  /* ──────────────────────────────────────────
     1. HEADER – Scroll behaviour
     iOS FIX: usar requestAnimationFrame + ticking para evitar jank
  ────────────────────────────────────────── */
  var cabecalho = document.getElementById('cabecalho');
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var fecharMenu = document.getElementById('fechar-menu');
  var scrollTicking = false;

  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function() {
        if (window.scrollY > 60) {
          cabecalho && cabecalho.classList.add('scrolled');
        } else {
          cabecalho && cabecalho.classList.remove('scrolled');
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  /* ──────────────────────────────────────────
     2. MOBILE MENU
     iOS FIX: overflow:hidden no body não funciona no iOS —
     usar position:fixed + top:-scrollY
  ────────────────────────────────────────── */
  var _menuScrollY = 0;
  var _mobileNavTimer = null;

  function getAnchorOffset() {
    // header pode variar em altura (estado scrolled/safe-area/breakpoints)
    if (cabecalho && cabecalho.offsetHeight) return cabecalho.offsetHeight + 8;
    return 60;
  }
  
  function abrirMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    hamburger && hamburger.classList.add('open');
    _menuScrollY = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + _menuScrollY + 'px';
    document.body.style.width = '100%';
  }

  function fecharMenuFn() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, _menuScrollY);
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      mobileMenu && mobileMenu.classList.contains('open') ? fecharMenuFn() : abrirMenu();
    });
  }
  if (fecharMenu) fecharMenu.addEventListener('click', fecharMenuFn);
 
 
  function navegarMenuMobile(destino) {
    if (!destino || destino.charAt(0) !== '#') return;

    if (_mobileNavTimer) {
      clearTimeout(_mobileNavTimer);
      _mobileNavTimer = null;
    }

    fecharMenuFn();

    // 100ms para permitir unlock do body + reflow no iOS antes do cálculo de posição
    _mobileNavTimer = setTimeout(function() {
      var secao = document.querySelector(destino);
      if (!secao) return;
      var top = secao.getBoundingClientRect().top + window.pageYOffset - 60;
      try { window.scrollTo({ top: top, behavior: 'smooth' }); }
      catch(e2) { window.scrollTo(0, top); }
      _mobileNavTimer = null;
    }, 100);
  }

  // ✅ CORRIGIDO: fechar menu e navegar sem conflito com a Secção 8
   document.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var destino = this.getAttribute('href');
      navegarMenuMobile(destino);
    });
  });

  /* ──────────────────────────────────────────
     3. HERO BACKGROUND SCALE
     iOS FIX: will-change + backface-visibility para performance GPU
  ────────────────────────────────────────── */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    heroBg.style.webkitBackfaceVisibility = 'hidden';
    heroBg.style.backfaceVisibility = 'hidden';
    heroBg.style.willChange = 'transform';
    requestAnimationFrame(function() { heroBg.classList.add('loaded'); });
  }

  /* ──────────────────────────────────────────
     4. SCROLL REVEAL (IntersectionObserver)
     iOS FIX: fallback para versões antigas sem IntersectionObserver
  ────────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var siblings = Array.from(
            (entry.target.parentElement && entry.target.parentElement.children) || []
          );
          var idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 80) + 'ms';
          entry.target.style.webkitTransitionDelay = (idx * 80) + 'ms';
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function(el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('visible'); });
  }

  /* ──────────────────────────────────────────
     5. FILTER DE PROJETOS
  ────────────────────────────────────────── */
  var filterBtns   = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filtro = btn.dataset.filter;
      projectCards.forEach(function(card) {
        var match = filtro === 'all' || card.dataset.category === filtro;
        card.style.webkitTransition = 'opacity 0.35s, -webkit-transform 0.35s';
        card.style.transition = 'opacity 0.35s, transform 0.35s';
        if (match) {
          card.style.display = '';
          requestAnimationFrame(function() {
            card.style.opacity = '1';
            card.style.webkitTransform = '';
            card.style.transform = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.webkitTransform = 'scale(0.95)';
          card.style.transform = 'scale(0.95)';
          setTimeout(function() { card.style.display = 'none'; }, 350);
        }
      });
    });
  });

  /* ──────────────────────────────────────────
     6. NOTÍCIAS – CRUD + Carrossel
  ────────────────────────────────────────── */
  var STORAGE_KEY   = 'rpp_publicacoes';
  var ADMIN_PASS    = 'rpp2026';

  function getCardsPerPage() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  var noticiasTrack = document.getElementById('noticias-track');
  var slideAtualEl  = document.getElementById('slide-atual');
  var slideTotalEl  = document.getElementById('slide-total');
  var btnPrev       = document.getElementById('noticias-prev');
  var btnNext       = document.getElementById('noticias-next');

  if (!noticiasTrack) return;

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
  }

  var publicacoesDefault = [
    {
      id: generateId(),
      titulo: 'Conclusão da Ponte Industrial Norte',
      resumo: 'A RPP concluiu mais uma ponte estratégica com 1,8 km e soluções de segurança sísmica de referência internacional.',
      categoria: 'Infraestrutura',
      imagem: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
      data: '2026-02-12'
    },
    {
      id: generateId(),
      titulo: 'Novo Centro Logístico em Luanda',
      resumo: 'Projeto de 35.000 m² com eficiência energética de última geração, automação inteligente e redução de custos operacionais.',
      categoria: 'Edificação',
      imagem: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      data: '2026-01-25'
    },
    {
      id: generateId(),
      titulo: 'Programa de Construção Sustentável',
      resumo: 'Nova iniciativa da RPP com metas ambientais concretas: redução de emissões em 40% nas próximas obras da empresa.',
      categoria: 'Sustentabilidade',
      imagem: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
      data: '2026-01-10'
    }
  ];

  function carregarPublicacoes() {
    try {
      var guardado = localStorage.getItem(STORAGE_KEY);
      if (!guardado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(publicacoesDefault));
        return publicacoesDefault.slice();
      }
      var parsed = JSON.parse(guardado);
      return (Array.isArray(parsed) && parsed.length) ? parsed : publicacoesDefault.slice();
    } catch(e) { return publicacoesDefault.slice(); }
  }

  function guardarPublicacoes() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(publicacoes)); } catch(e) {}
  }

  function formatarData(valor) {
    if (!valor) return '';
    try {
      return new Date(valor).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch(e) { return valor; }
  }

  var publicacoes = carregarPublicacoes();
  var paginaAtual = 0;

  function renderCarousel() {
    var cpp = getCardsPerPage();
    var totalPaginas = Math.max(1, Math.ceil(publicacoes.length / cpp));
    if (paginaAtual >= totalPaginas) paginaAtual = 0;

    if (!publicacoes.length) {
      noticiasTrack.innerHTML =
        '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#9ca3af;">' +
        '<i class="fa-solid fa-newspaper" style="font-size:36px; margin-bottom:12px; display:block;"></i>' +
        'Sem publicações no momento.</div>';
      if (slideAtualEl) slideAtualEl.textContent = '0';
      if (slideTotalEl) slideTotalEl.textContent = '0';
      return;
    }

    var inicio = paginaAtual * cpp;
    var slice  = publicacoes.slice(inicio, inicio + cpp);

    noticiasTrack.style.opacity = '0';
    noticiasTrack.style.webkitTransform = 'translateY(10px)';
    noticiasTrack.style.transform = 'translateY(10px)';

    setTimeout(function() {
      noticiasTrack.innerHTML = slice.map(function(item) {
        return '<article class="noticia-card">' +
          '<img src="' + item.imagem + '" alt="' + item.titulo + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=60\'">' +
          '<div class="noticia-conteudo">' +
          '<span class="noticia-meta">' + item.categoria + (item.data ? ' · ' + formatarData(item.data) : '') + '</span>' +
          '<h3>' + item.titulo + '</h3>' +
          '<p>' + item.resumo + '</p>' +
          '</div></article>';
      }).join('');

      noticiasTrack.style.webkitTransition = 'opacity 0.4s ease, -webkit-transform 0.4s ease';
      noticiasTrack.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      noticiasTrack.style.opacity = '1';
      noticiasTrack.style.webkitTransform = '';
      noticiasTrack.style.transform = '';

      if (slideAtualEl) slideAtualEl.textContent = String(paginaAtual + 1);
      if (slideTotalEl) slideTotalEl.textContent = String(totalPaginas);
    }, 200);
  }

  function goNext() {
    var cpp = getCardsPerPage();
    var total = Math.ceil(publicacoes.length / cpp);
    paginaAtual = (paginaAtual + 1) % total;
    renderCarousel();
  }

  function goPrev() {
    var cpp = getCardsPerPage();
    var total = Math.ceil(publicacoes.length / cpp);
    paginaAtual = (paginaAtual - 1 + total) % total;
    renderCarousel();
  }

  if (btnPrev) btnPrev.addEventListener('click', function() { resetAutoplay(); goPrev(); });
  if (btnNext) btnNext.addEventListener('click', function() { resetAutoplay(); goNext(); });

  var autoPlay = setInterval(goNext, 6000);
  function resetAutoplay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(goNext, 6000);
  }

  var _lastW = window.innerWidth;
  window.addEventListener('resize', function() {
    var w = window.innerWidth;
    if (w !== _lastW) { _lastW = w; renderCarousel(); }
  }, { passive: true });

  var touchStartX = 0, touchStartY = 0;
  noticiasTrack.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  noticiasTrack.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      resetAutoplay();
      if (dx > 0) goPrev(); else goNext();
    }
  }, { passive: true });

  renderCarousel();

  /* ──────────────────────────────────────────
     7. ADMIN PANEL
  ────────────────────────────────────────── */
  var loginForm      = document.getElementById('admin-login-form');
  var loginSenha     = document.getElementById('admin-password');
  var loginErro      = document.getElementById('admin-login-error');
  var adminPanel     = document.getElementById('admin-panel');
  var sairAdmin      = document.getElementById('admin-logout');
  var formPublicacao = document.getElementById('publicacao-form');
  var inputId        = document.getElementById('publicacao-id');
  var inputTitulo    = document.getElementById('publicacao-titulo');
  var inputResumo    = document.getElementById('publicacao-resumo');
  var inputCategoria = document.getElementById('publicacao-categoria');
  var inputImagem    = document.getElementById('publicacao-imagem');
  var btnCancelar    = document.getElementById('cancelar-edicao');
  var listaEl        = document.getElementById('lista-publicacoes');

  function limparForm() {
    formPublicacao && formPublicacao.reset();
    if (inputId)     inputId.value = '';
    if (btnCancelar) btnCancelar.classList.add('hidden');
    var titulo = formPublicacao && formPublicacao.querySelector('h4');
    if (titulo) titulo.textContent = 'Nova Publicação';
  }

  function renderLista() {
    if (!listaEl) return;
    if (!publicacoes.length) {
      listaEl.innerHTML = '<li class="text-sm text-gray-400 p-3">Nenhuma publicação cadastrada.</li>';
      return;
    }
    listaEl.innerHTML = publicacoes.map(function(item) {
      return '<li class="admin-item">' +
        '<div><strong>' + item.titulo + '</strong>' +
        '<p>' + item.categoria + (item.data ? ' · ' + formatarData(item.data) : '') + '</p></div>' +
        '<div class="admin-actions">' +
        '<button type="button" data-editar="' + item.id + '"><i class="fa-solid fa-pen" style="font-size:.7rem;margin-right:3px"></i> Editar</button>' +
        '<button type="button" data-apagar="' + item.id + '" class="danger"><i class="fa-solid fa-trash" style="font-size:.7rem;margin-right:3px"></i> Apagar</button>' +
        '</div></li>';
    }).join('');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (loginSenha && loginSenha.value.trim() === ADMIN_PASS) {
        adminPanel && adminPanel.classList.remove('hidden');
        loginForm.classList.add('hidden');
        if (loginErro) loginErro.textContent = '';
        if (loginSenha) loginSenha.value = '';
        renderLista();
      } else if (loginErro) {
        loginErro.textContent = 'Senha incorreta. Tente novamente.';
      }
    });
  }

  if (sairAdmin) {
    sairAdmin.addEventListener('click', function() {
      adminPanel && adminPanel.classList.add('hidden');
      loginForm && loginForm.classList.remove('hidden');
      limparForm();
    });
  }

  if (btnCancelar) btnCancelar.addEventListener('click', limparForm);

  function lerImagemBase64(file, cb) {
    var r = new FileReader();
    r.onload  = function() { cb(null, r.result); };
    r.onerror = function() { cb(new Error('Erro ao ler imagem.')); };
    r.readAsDataURL(file);
  }

  if (formPublicacao) {
    formPublicacao.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = formPublicacao.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:6px"></i> A guardar...'; }

      var idEdicao   = inputId && inputId.value;
      var titulo     = inputTitulo && inputTitulo.value.trim();
      var resumo     = inputResumo && inputResumo.value.trim();
      var categoria  = inputCategoria && inputCategoria.value;
      var file       = inputImagem && inputImagem.files && inputImagem.files[0];
      var imgAtual   = idEdicao ? (publicacoes.find ? (publicacoes.find(function(p) { return p.id === idEdicao; }) || {}).imagem || '' : '') : '';

      function finish(imagemFinal) {
        if (!imagemFinal) { alert('Por favor escolha uma imagem.'); if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right:6px"></i> Guardar publicação'; } return; }
        if (idEdicao) {
          publicacoes = publicacoes.map(function(p) {
            return p.id === idEdicao ? {id:p.id, titulo:titulo, resumo:resumo, categoria:categoria, imagem:imagemFinal, data:p.data} : p;
          });
        } else {
          publicacoes.unshift({
            id: generateId(),
            titulo: titulo, resumo: resumo, categoria: categoria, imagem: imagemFinal,
            data: new Date().toISOString().slice(0, 10)
          });
        }
        guardarPublicacoes();
        paginaAtual = 0;
        renderCarousel();
        renderLista();
        limparForm();
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right:6px"></i> Guardar publicação'; }
      }

      if (file) {
        lerImagemBase64(file, function(err, result) {
          finish(err ? imgAtual : result);
        });
      } else {
        finish(imgAtual);
      }
    });
  }

  if (listaEl) {
    listaEl.addEventListener('click', function(e) {
      var btnEditar = e.target && e.target.closest && e.target.closest('[data-editar]');
      var btnApagar = e.target && e.target.closest && e.target.closest('[data-apagar]');

      if (btnEditar) {
        var item = null;
        for (var i = 0; i < publicacoes.length; i++) {
          if (publicacoes[i].id === btnEditar.dataset.editar) { item = publicacoes[i]; break; }
        }
        if (!item) return;
        if (inputId)        inputId.value = item.id;
        if (inputTitulo)    inputTitulo.value = item.titulo;
        if (inputResumo)    inputResumo.value = item.resumo;
        if (inputCategoria) inputCategoria.value = item.categoria;
        if (btnCancelar)    btnCancelar.classList.remove('hidden');
        var titulo = formPublicacao && formPublicacao.querySelector('h4');
        if (titulo) titulo.textContent = 'Editar Publicação';
        if (formPublicacao) {
          try { formPublicacao.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          catch(e2) { formPublicacao.scrollIntoView(); }
        }
      }

      if (btnApagar) {
        if (!confirm('Tem a certeza que deseja eliminar esta publicação?')) return;
        var idAp = btnApagar.dataset.apagar;
        publicacoes = publicacoes.filter(function(p) { return p.id !== idAp; });
        guardarPublicacoes();
        paginaAtual = 0;
        renderCarousel();
        renderLista();
        limparForm();
      }
    });
  }

  /* ──────────────────────────────────────────
     8. SMOOTH SCROLL para âncoras
     iOS FIX: ignorar links do menu mobile (já têm handler próprio)
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    // ✅ CORRIGIDO: ignorar links do menu mobile — já têm handler próprio na Secção 2
    if (a.classList.contains('mobile-nav-link') || a.classList.contains('mobile-cta')) return;

    a.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (!href || href.length <= 1) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 60;
      try { window.scrollTo({ top: top, behavior: 'smooth' }); }
      catch(e2) { window.scrollTo(0, top); }
    });
  });

  /* ──────────────────────────────────────────
     9. ACTIVE NAV LINK (IntersectionObserver)
  ────────────────────────────────────────── */
  var navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(a) {
            a.style.color = '';
            if (a.getAttribute('href') === '#' + id) {
              a.style.color = 'var(--ouro)';
            }
          });
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('section[id]').forEach(function(s) { navObs.observe(s); });
  }

});