// ========================================
// Factory Açaí - script.js
// ========================================

let tamanhos = [
  { id: '300ml', nome: 'Mini Fábrica', valor: '300 ml', preco: 16.00 },
  { id: '500ml', nome: 'Alta Produção', valor: '500 ml', preco: 19.00 },
  { id: '700ml', nome: 'Potência Máxima', valor: '700 ml', preco: 25.00 },
];

let acompanhamentos = [
  {
    categoria: 'Frutas',
    itens: [
      { id: 'banana', nome: 'Banana', preco: 3.00, emoji: '🍌' },
      { id: 'morango', nome: 'Morango', preco: 4.00, emoji: '🍓' },
      { id: 'abacaxi', nome: 'Abacaxi', preco: 4.00, emoji: '🍍' },
      { id: 'maracuja', nome: 'Maracujá', preco: 3.50, emoji: '' },
      { id: 'uva-verde', nome: 'Uva verde', preco: 4.00, emoji: '🍇' },
    ],
  },
  {
    categoria: 'Chocolates, doces e complementos',
    itens: [
      { id: 'leite-condensado', nome: 'Leite condensado', preco: 3.50, emoji: '🥛' },
      { id: 'leite-em-po', nome: 'Leite em pó', preco: 3.50, emoji: '🥛' },
      { id: 'bis-branco', nome: 'Bis branco', preco: 3.50, emoji: '🍫' },
      { id: 'bis-preto', nome: 'Bis preto', preco: 3.50, emoji: '🍫' },
      { id: 'pacoquinha', nome: 'Paçoquinha', preco: 3.00, emoji: '🥜' },
      { id: 'amendoim', nome: 'Amendoim granulado', preco: 3.00, emoji: '🥜' },
      { id: 'coco-ralado', nome: 'Coco ralado', preco: 3.00, emoji: '🥥' },
      { id: 'bolacha-oleo', nome: 'Bolacha Óleo', preco: 4.00, emoji: '🍪' },
      { id: 'confete', nome: 'Confete', preco: 3.50, emoji: '🍬' },
      { id: 'ouro-branco', nome: 'Ouro Branco', preco: 4.00, emoji: '🍫' },
      { id: 'sonho-de-valsa', nome: 'Sonho de Valsa', preco: 4.00, emoji: '🍫' },
      { id: 'nutella', nome: 'Nutella', preco: 7.00, emoji: '🍫' },
      { id: 'trento', nome: 'Trento', preco: 4.00, emoji: '🍫' },
      { id: 'kit-kat', nome: 'Kit Kat', preco: 5.00, emoji: '🍫' },
      { id: 'aveia', nome: 'Aveia', preco: 3.00, emoji: '🌾' },
      { id: 'laka', nome: 'Laka', preco: 5.00, emoji: '🍫' },
      { id: 'diamante-negro', nome: 'Diamante Negro', preco: 5.00, emoji: '🍫' },
      { id: 'marshmallow', nome: 'Marshmallow', preco: 4.00, emoji: '🍡' },
      { id: 'ovomaltine', nome: 'Ovomaltine', preco: 4.00, emoji: '🥤' },
      { id: 'creme-avelha', nome: 'Creme de avelã', preco: 4.50, emoji: '🌰' },
      { id: 'chocolate-branco', nome: 'Chocolate branco', preco: 4.50, emoji: '🍫' },
      { id: 'leite-condensado-zero', nome: 'Leite condensado zero lactose', preco: 6.00, emoji: '🥛' },
      { id: 'leite-em-po-zero', nome: 'Leite em pó zero lactose', preco: 6.00, emoji: '🥛' },
      { id: 'mousse-maracuja', nome: 'Mousse de maracujá', preco: 4.00, emoji: '🍮' },
      { id: 'mousse-morango', nome: 'Mousse de morango', preco: 4.00, emoji: '🍮' },
      { id: 'mousse-leite-po', nome: 'Mousse de leite em pó', preco: 4.00, emoji: '🍮' },
      { id: 'calda-chocolate', nome: 'Calda de chocolate', preco: 3.00, emoji: '🍫' },
      { id: 'calda-morango', nome: 'Calda de morango', preco: 3.00, emoji: '🍓' },
    ],
  },
];

let carrinho = [];
const modalState = {
  etapa: 1,
  tamanho: null,
  complementos: [],
  observacao: '',
  qtd: 1,
};

let modalProduto = null;
let cartDrawer = null;
let modalCheckout = null;
let btnCheckout = null;

function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}

async function carregarCatalogo() {
  const [{ data: produtos, error: erroProdutos }, { data: adicionais, error: erroAdicionais }] = await Promise.all([
    factorySupabase.from('factory_catalogo_produtos').select('*').eq('ativo', true).order('ordem'),
    factorySupabase.from('factory_catalogo_adicionais').select('*').eq('ativo', true).order('ordem')
  ]);
  if (erroProdutos || erroAdicionais) throw (erroProdutos || erroAdicionais);
  if (produtos?.length) tamanhos = produtos.map(p => ({ id: p.id, nome: p.nome, valor: p.valor || p.nome, preco: Number(p.preco), descricao: p.descricao || '' }));
  if (adicionais) {
    const grupos = new Map();
    adicionais.forEach(a => {
      if (!grupos.has(a.categoria)) grupos.set(a.categoria, { categoria: a.categoria, itens: [] });
      grupos.get(a.categoria).itens.push({ id: a.id, nome: a.nome, preco: Number(a.preco), emoji: a.emoji || '➕' });
    });
    acompanhamentos = [...grupos.values()];
  }
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fecharModal(id) {
  const el = document.getElementById(id);
  if (el) {
    const focused = document.activeElement;
    if (focused && focused.closest('.modal')) focused.blur();
    el.removeAttribute('data-aberto');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function abrirPedido() {
  modalState.etapa = 1;
  modalState.tamanho = null;
  modalState.complementos = [];
  modalState.observacao = '';
  modalState.qtd = 1;
  renderWizard();
  atualizarResumo();
  if (modalProduto) {
    modalProduto.removeAttribute('aria-hidden');
    modalProduto.setAttribute('data-aberto', 'true');
    document.body.style.overflow = 'hidden';
  }
}

function selecionarTamanho(tamanhoId) {
  modalState.tamanho = tamanhoId;
  renderWizard();
  atualizarResumo();
}

function toggleComplemento(complementoId, selecionado) {
  if (selecionado) {
    modalState.complementos.push(complementoId);
  } else {
    modalState.complementos = modalState.complementos.filter((c) => c !== complementoId);
  }
  renderWizard();
  atualizarResumo();
}

function atualizarResumo() {
  let preco = 0;
  let tamanhoTexto = '--';
  let compsTexto = '--';

  if (modalState.tamanho) {
    const t = tamanhos.find((x) => x.id === modalState.tamanho);
    if (t) {
      preco = t.preco;
      tamanhoTexto = `${t.nome} · ${t.valor}`;
    }
  }

  modalState.complementos.forEach((cid) => {
    const cat = acompanhamentos.find((c) => c.itens.some((i) => i.id === cid));
    if (cat) {
      const item = cat.itens.find((i) => i.id === cid);
      if (item) {
        preco += item.preco;
        if (compsTexto === '--') compsTexto = item.nome;
        else compsTexto += ', ' + item.nome;
      }
    }
  });

  const resumoTamanho = document.getElementById('resumo-tamanho');
  const resumoComplementos = document.getElementById('resumo-complementos');
  const resumoTotal = document.getElementById('resumo-total');

  if (resumoTamanho) resumoTamanho.textContent = tamanhoTexto;
  if (resumoComplementos) resumoComplementos.textContent = compsTexto;
  if (resumoTotal) resumoTotal.textContent = formatarMoeda(preco);

  if (resumoComplementos) {
    if (compsTexto === '--') resumoComplementos.classList.add('empty');
    else resumoComplementos.classList.remove('empty');
  }

  if (resumoTamanho) {
    if (tamanhoTexto === '--') resumoTamanho.classList.add('empty');
    else resumoTamanho.classList.remove('empty');
  }
}

function renderWizard() {
  document.querySelectorAll('.step-progress').forEach((el) => {
    const step = parseInt(el.dataset.step);
    el.classList.toggle('active', step === modalState.etapa);
  });

  document.querySelectorAll('.progress-label').forEach((el) => {
    const step = parseInt(el.id.replace('lbl-', ''));
    el.classList.toggle('active', step === modalState.etapa);
  });

  const tamanhosEl = document.getElementById('buy-tamanhos');
  if (tamanhosEl) {
    tamanhosEl.innerHTML = tamanhos.map((t) => `
      <label class="tamanho-card ${modalState.tamanho === t.id ? 'selected' : ''}">
        <input type="radio" name="tamanho" value="${t.id}" ${modalState.tamanho === t.id ? 'checked' : ''} onchange="selecionarTamanho('${t.id}')">
        <span class="tamanho-nome">${t.nome}</span>
        <span class="tamanho-info">${t.valor} · ${formatarMoeda(t.preco)}</span>
      </label>
    `).join('');
  }

  const compsEl = document.getElementById('buy-complementos');
  if (compsEl) {
    compsEl.innerHTML = acompanhamentos.flatMap((cat) => cat.itens).map((c) => `
      <label class="complemento-card ${modalState.complementos.includes(c.id) ? 'selected' : ''}">
        <input type="checkbox" value="${c.id}" ${modalState.complementos.includes(c.id) ? 'checked' : ''} onchange="toggleComplemento('${c.id}', this.checked)">
        <span class="complemento-emoji">${c.emoji}</span>
        <span class="complemento-card-nome">${c.nome}</span>
        <span class="complemento-card-preco">+ ${formatarMoeda(c.preco)}</span>
      </label>
    `).join('');
  }

  const obsTextarea = document.getElementById('buy-observacao');
  if (obsTextarea) obsTextarea.value = modalState.observacao;

  const qtdInput = document.getElementById('buy-qtd');
  if (qtdInput) qtdInput.value = modalState.qtd;

  document.querySelectorAll('.buy-panel').forEach((panel) => {
    panel.classList.toggle('active', parseInt(panel.dataset.step) === modalState.etapa);
  });

  const btnVoltar = document.getElementById('buy-voltar');
  const btnProximo = document.getElementById('buy-proximo');
  const btnAdd = document.getElementById('buy-add');

  if (btnVoltar) btnVoltar.style.display = modalState.etapa > 1 ? 'inline-flex' : 'none';

  if (modalState.etapa === 4) {
    if (btnProximo) btnProximo.style.display = 'none';
    if (btnAdd) btnAdd.style.display = 'inline-flex';
  } else {
    if (btnProximo) btnProximo.style.display = 'inline-flex';
    if (btnAdd) btnAdd.style.display = 'none';
  }

  if (btnProximo) {
    if (modalState.etapa === 1 && !modalState.tamanho) btnProximo.disabled = true;
    else btnProximo.disabled = false;
  }
}

function atualizarCarrinho() {
  const cartItens = document.getElementById('cart-itens');
  const cartCount = document.getElementById('cart-count');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');
  const cartVazio = document.getElementById('cart-vazio');
  const cartResumo = document.getElementById('cart-resumo');

  if (!cartItens) return;

  cartItens.innerHTML = '';
  let totalItens = 0;
  let subtotal = 0;

  if (carrinho.length === 0) {
    if (cartVazio) cartVazio.style.display = 'block';
    if (cartResumo) cartResumo.style.display = 'none';
    const btnCheckoutEl = document.getElementById('btn-checkout');
    if (btnCheckoutEl) btnCheckoutEl.disabled = true;
  } else {
    if (cartVazio) cartVazio.style.display = 'none';
    if (cartResumo) cartResumo.style.display = 'block';
    const btnCheckoutEl = document.getElementById('btn-checkout');
    if (btnCheckoutEl) btnCheckoutEl.disabled = false;

    carrinho.forEach((item, idx) => {
      subtotal += item.preco * item.qtd;
      totalItens += item.qtd;

      const compsHtml =
        item.complementos && item.complementos.length
          ? `<div class="comps">+ ${item.complementos
              .map((cid) => {
                const cat = acompanhamentos.find((c) => c.itens.some((i) => i.id === cid));
                return cat ? cat.itens.find((i) => i.id === cid)?.nome || cid : cid;
              })
              .join(', ')}</div>`
          : '';

      const obsHtml = item.observacao
        ? `<div class="obs">Observação: ${item.observacao}</div>`
        : '';

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="imagem">🫐</div>
        <div class="info">
          <div class="nome">${item.nome}</div>
          <div class="tamanho-cart">${item.tamanho}</div>
          ${compsHtml}
          ${obsHtml}
          <div class="preco">${formatarMoeda(item.preco)}</div>
        </div>
        <div class="cart-qtd">
          <button type="button" data-acao="diminuir" data-idx="${idx}">−</button>
          <span>${item.qtd}</span>
          <button type="button" data-acao="aumentar" data-idx="${idx}">+</button>
          <button type="button" class="remover" data-acao="remover" data-idx="${idx}" title="Remover">🗑️</button>
        </div>
      `;
      cartItens.appendChild(el);
    });
  }

  if (cartCount) cartCount.textContent = totalItens;
  if (cartCountBadge) cartCountBadge.textContent = totalItens + ' itens';
  if (cartSubtotal) cartSubtotal.textContent = formatarMoeda(subtotal);
  if (cartTotal) cartTotal.textContent = formatarMoeda(subtotal);
}

document.addEventListener('DOMContentLoaded', async () => {
  try { await carregarCatalogo(); } catch (err) { console.error('Falha ao carregar cardápio:', err); alert('Não foi possível carregar o cardápio. Tente novamente mais tarde.'); }
  const btnFazerPedidoTopo = document.getElementById('btn-fazer-pedido-topo');
  modalProduto = document.getElementById('modal-produto');
  cartDrawer = document.getElementById('carrinho');
  modalCheckout = document.getElementById('modal-checkout');
  btnCheckout = document.getElementById('btn-checkout');

  if (btnFazerPedidoTopo) {
    btnFazerPedidoTopo.addEventListener('click', abrirPedido);
  }

  const btnCart = document.getElementById('cart-btn');
  if (btnCart) {
    btnCart.addEventListener('click', () => {
      const cart = document.getElementById('carrinho');
      if (cart) {
        const estaAberto = cart.getAttribute('data-aberto') === 'true';
        if (estaAberto) {
          cart.removeAttribute('data-aberto');
          cart.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        } else {
          cart.setAttribute('data-aberto', 'true');
          cart.removeAttribute('aria-hidden');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      // Fecha completamente o carrinho antes de abrir o checkout.
      // Isso evita que o drawer (z-index maior) cubra o formulário em celulares.
      if (cartDrawer) {
        cartDrawer.removeAttribute('data-aberto');
        cartDrawer.setAttribute('aria-hidden', 'true');
      }
      if (modalCheckout) {
        modalCheckout.removeAttribute('aria-hidden');
        modalCheckout.setAttribute('data-aberto', 'true');
      }
      document.body.style.overflow = 'hidden';
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal[data-aberto="true"]').forEach((m) => fecharModal(m.id));
      if (cartDrawer) cartDrawer.removeAttribute('data-aberto');
      document.body.style.overflow = '';
    }
  });

  const btnVoltar = document.getElementById('buy-voltar');
  const btnProximo = document.getElementById('buy-proximo');

  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      modalState.etapa = modalState.etapa > 1 ? modalState.etapa - 1 : 1;
      renderWizard();
    });
  }

  if (btnProximo) {
    btnProximo.addEventListener('click', () => {
      if (modalState.etapa === 1 && !modalState.tamanho) {
        btnProximo.disabled = true;
        return;
      }
      modalState.etapa++;
      renderWizard();
    });
  }

  const btnAdd = document.getElementById('buy-add');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const item = {
        nome: document.getElementById('buy-titulo')?.textContent || 'Açaí Factory',
        tamanho: modalState.tamanho || '300ml',
        qtd: modalState.qtd,
        preco: 0,
        complementos: [...modalState.complementos],
        observacao: modalState.observacao
      };

      const t = tamanhos.find((x) => x.id === modalState.tamanho);
      if (t) item.preco = t.preco;
      else item.preco = 16.00;

      modalState.complementos.forEach((cid) => {
        const cat = acompanhamentos.find((c) => c.itens.some((i) => i.id === cid));
        if (cat) {
          const itemCat = cat.itens.find((i) => i.id === cid);
          if (itemCat) item.preco += itemCat.preco;
        }
      });

      carrinho.push(item);
      atualizarCarrinho();
      fecharModal('modal-produto');
    });
  }

  document.querySelectorAll('[data-fechar]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) fecharModal(modal.id);
    });
  });
  document.querySelectorAll('[data-fechar-login]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) fecharModal(modal.id);
    });
  });
  document.querySelectorAll('[data-fechar-consulta]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) fecharModal(modal.id);
    });
  });
  document.querySelectorAll('[data-fechar-checkout]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) fecharModal(modal.id);
    });
  });
  document.querySelectorAll('[data-fechar-carrinho]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal');
      if (modal) fecharModal(modal.id);
    });
  });

  const btnAdmin = document.getElementById('btn-admin');
  const modalLogin = document.getElementById('modal-login');
  const formLogin = document.getElementById('form-login');
  const loginErro = document.getElementById('login-erro');


  if (btnAdmin && modalLogin) {
    btnAdmin.addEventListener('click', () => {
      modalLogin.removeAttribute('data-aberto');
      modalLogin.setAttribute('data-aberto', 'true');
      document.body.style.overflow = 'hidden';
    });

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const campoEmail = document.getElementById('login-email');
        const campoSenha = document.getElementById('login-senha');
        if (!campoEmail || !campoSenha) { if (loginErro) loginErro.textContent = 'Campos de login não encontrados.'; return; }
        const email = campoEmail.value.trim();
        const senha = campoSenha.value;
        const { data, error } = await factorySupabase.auth.signInWithPassword({ email, password: senha });
        if (!error && data.user) {
          const { data: autorizado, error: authError } = await factorySupabase.rpc('factory_is_admin');
          if (!authError && autorizado === true) {
            fecharModal('modal-login');
            if (loginErro) loginErro.style.display = 'none';
            formLogin.reset();
            window.location.href = 'admin.html';
            return;
          }
          await factorySupabase.auth.signOut();
        }
        if (loginErro) loginErro.style.display = 'block';
        document.getElementById('login-senha')?.focus();
      });
    }

    function fecharModalLogin() {
      modalLogin.removeAttribute('data-aberto');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-fechar-login]').forEach((btn) => {
      btn.addEventListener('click', fecharModalLogin);
    });

    const overlayLogin = modalLogin.querySelector('.modal-overlay');
    if (overlayLogin) overlayLogin.addEventListener('click', fecharModalLogin);

    const btnCancelarLogin = document.getElementById('btn-cancelar-login');
    if (btnCancelarLogin) btnCancelarLogin.addEventListener('click', fecharModalLogin);
  }

  // Checkout: os campos são buscados dentro do formulário e validados antes do RPC.
  const formCheckout = document.getElementById('form-checkout');
  if (formCheckout) {
    formCheckout.addEventListener('submit', async (e) => {
      e.preventDefault();

      const campoNome = formCheckout.querySelector('#checkout-nome');
      const campoEndereco = formCheckout.querySelector('#checkout-endereco');
      const campoTelefone = formCheckout.querySelector('#checkout-telefone');
      const campoPagamento = formCheckout.querySelector('#checkout-pagamento');
      const msg = document.getElementById('checkout-msg');
      const submit = formCheckout.querySelector('[type="submit"]');

      // Evita o erro "Cannot read properties of null (reading 'value')"
      // caso algum campo tenha sido removido ou esteja com ID diferente no HTML.
      const camposAusentes = [];
      if (!campoNome) camposAusentes.push('checkout-nome');
      if (!campoEndereco) camposAusentes.push('checkout-endereco');
      if (!campoTelefone) camposAusentes.push('checkout-telefone');
      if (!campoPagamento) camposAusentes.push('checkout-pagamento');

      if (camposAusentes.length) {
        console.error('Campos ausentes no checkout:', camposAusentes);
        if (msg) msg.textContent = 'O formulário está incompleto. Atualize o site ou contate o suporte.';
        return;
      }

      const nome = campoNome.value.trim();
      const endereco = campoEndereco.value.trim();
      const telefone = campoTelefone.value.trim();
      const pagamento = campoPagamento.value;

      if (!carrinho.length) {
        if (msg) msg.textContent = 'Adicione pelo menos um produto ao carrinho.';
        return;
      }
      if (nome.length < 2 || endereco.length < 5 || telefone.replace(/\D/g, '').length < 10 || !pagamento) {
        if (msg) msg.textContent = 'Confira nome, endereço, telefone e forma de pagamento.';
        return;
      }
      if (!window.factorySupabase) {
        if (msg) msg.textContent = 'A conexão com o sistema de pedidos não foi carregada. Atualize a página.';
        console.error('factorySupabase não foi inicializado.');
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Enviando pedido...';
      }
      if (msg) msg.textContent = 'Enviando seu pedido...';

      try {
        // O banco calcula os preços a partir dos IDs do tamanho e dos adicionais.
        const itens = carrinho.map((i) => ({
          nome: i.nome,
          tamanho: i.tamanho,
          qtd: Number(i.qtd) || 1,
          preco: Number(i.preco) || 0,
          complementos: Array.isArray(i.complementos) ? i.complementos : [],
          observacao: i.observacao || ''
        }));

        const { data: pedidoResultado, error } = await factorySupabase.rpc('factory_criar_pedido', {
          p_nome: nome,
          p_endereco: endereco,
          p_telefone: telefone,
          p_pagamento: pagamento,
          p_itens: itens
        });
        if (error) throw error;

        const pedidoId = typeof pedidoResultado === 'object' && pedidoResultado !== null
          ? pedidoResultado.id
          : pedidoResultado;
        const totalCalculado = itens.reduce((soma, item) => soma + item.preco * item.qtd, 0);
        const totalConfirmado = typeof pedidoResultado === 'object' && pedidoResultado !== null
          ? Number(pedidoResultado.total)
          : totalCalculado;

        if (!pedidoId) throw new Error('O Supabase não retornou o número do pedido.');

        if (msg) {
          msg.innerHTML = `<div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:800;color:#2e7d32;margin-bottom:10px;">✅ Pedido recebido!</div>
            <div>Número do pedido: <strong style="color:#5b149a;">#${escaparHTML(pedidoId)}</strong></div>
            <div>Total: ${formatarMoeda(totalConfirmado)} | Pagamento: ${escaparHTML(pagamento)}</div>
            <div>Telefone: ${escaparHTML(telefone)}</div>
            <div style="font-size:.85rem;color:#888;">Guarde o número para consultar o andamento do pedido.</div>
            <a href="https://wa.me/554999825639?text=${encodeURIComponent(`Olá! Meu pedido Factory Açaí é #${pedidoId}.`)}" target="_blank" rel="noopener" class="btn btn-primary" style="display:inline-block;margin-top:12px;">Enviar mensagem no WhatsApp</a>
          </div>`;
        }

        carrinho = [];
        atualizarCarrinho();
        formCheckout.reset();
      } catch (err) {
        console.error('Erro ao salvar pedido no Supabase:', err);
        if (msg) msg.textContent = `Não foi possível enviar o pedido: ${err.message || 'erro inesperado'}`;
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Confirmar Pedido';
        }
      }
    });
  }

  const btnNavRastrear = document.getElementById('btn-rastrear');
  const btnAbrirConsulta = document.getElementById('btn-abrir-consulta');
  const modalConsultaPedido = document.getElementById('modal-consulta-pedido');
  const formConsultaPedido = document.getElementById('form-consulta-pedido');
  const consultaNumero = document.getElementById('consulta-numero');
  const consultaResultado = document.getElementById('resultado-consulta');

  if (btnNavRastrear) {
    btnNavRastrear.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalConsultaPedido) {
        modalConsultaPedido.removeAttribute('aria-hidden');
        modalConsultaPedido.setAttribute('data-aberto', 'true');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (btnAbrirConsulta) {
    btnAbrirConsulta.addEventListener('click', () => {
      if (modalConsultaPedido) {
        modalConsultaPedido.removeAttribute('aria-hidden');
        modalConsultaPedido.setAttribute('data-aberto', 'true');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  const overlayConsulta = document.querySelector('[data-fechar-consulta]');
  if (overlayConsulta) {
    overlayConsulta.addEventListener('click', () => {
      modalConsultaPedido.removeAttribute('data-aberto');
      modalConsultaPedido.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  const btnFecharConsulta = document.querySelector('[data-fechar-consulta]');
  if (btnFecharConsulta) {
    btnFecharConsulta.addEventListener('click', () => {
      modalConsultaPedido.removeAttribute('data-aberto');
      modalConsultaPedido.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  if (formConsultaPedido && consultaNumero && consultaResultado) {
    formConsultaPedido.addEventListener('submit', async (e) => {
      e.preventDefault();
      const numero = consultaNumero.value.trim().replace(/^#/, '');
      const submit = formConsultaPedido.querySelector('[type="submit"]');

      if (!/^\d+$/.test(numero)) {
        consultaResultado.style.display = 'block';
        consultaResultado.textContent = 'Digite um número de pedido válido.';
        consultaNumero.focus();
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Consultando...';
      }
      consultaResultado.style.display = 'block';
      consultaResultado.textContent = 'Consultando pedido...';

      try {
        const { data, error } = await factorySupabase.rpc(
          'factory_consultar_pedido',
          { p_numero: Number(numero) }
        );
        if (error) throw error;

        const p = Array.isArray(data) ? data[0] : data;
        if (!p || !p.id) {
          consultaResultado.textContent = 'Pedido não encontrado. Confira o número e tente novamente.';
          return;
        }

        const itens = Array.isArray(p.itens) ? p.itens : [];
        const itensHtml = itens.map((i) => {
          const comps = Array.isArray(i.complementos)
            ? i.complementos.map(escaparHTML).join(', ')
            : escaparHTML(i.complementos || '');
          return `<div style="padding:6px 0;border-bottom:1px solid #e9cff7;">
            <strong>${Number(i.qtd) || 1}x ${escaparHTML(i.nome || 'Produto')}</strong>
            <span style="float:right;">${formatarMoeda(Number(i.preco) || 0)}</span>
            ${i.tamanho ? `<div style="font-size:.85rem;color:#666;">Tamanho: ${escaparHTML(i.tamanho)}</div>` : ''}
            ${comps ? `<div style="font-size:.85rem;color:#6b5b95;">+ ${comps}</div>` : ''}
            ${i.observacao ? `<div style="font-size:.85rem;font-style:italic;">Obs: ${escaparHTML(i.observacao)}</div>` : ''}
          </div>`;
        }).join('');

        const dataPedido = p.criado_em ? new Date(p.criado_em).toLocaleString('pt-BR') : 'Não informada';
        consultaResultado.innerHTML = `<div style="background:#f8f9fa;padding:15px;border-radius:10px;border-left:4px solid var(--roxo);">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <strong style="color:#5b149a;">Pedido #${escaparHTML(p.id)}</strong>
            <strong style="color:#2e7d32;">${escaparHTML(p.status || 'Pendente')}</strong>
          </div>
          <div style="font-size:.9rem;margin:10px 0;">
            <div><b>Total:</b> ${formatarMoeda(Number(p.total) || 0)}</div>
            <div><b>Data:</b> ${escaparHTML(dataPedido)}</div>
          </div>
          <h4>Itens do pedido</h4>
          ${itensHtml || '<p>Nenhum item encontrado.</p>'}
        </div>`;
      } catch (err) {
        console.error('Erro ao consultar pedido:', err);
        consultaResultado.textContent = 'Não foi possível consultar. Confira se a função SQL factory_consultar_pedido(bigint) foi atualizada.';
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Consultar';
        }
      }
    });
  }

  atualizarCarrinho();
});
