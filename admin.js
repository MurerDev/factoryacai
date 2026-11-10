/* Factory Açaí — painel administrativo */
'use strict';

const STATUS_PEDIDO = ['Pendente', 'Em preparo', 'Saiu para entrega', 'Entregue', 'Cancelado'];
const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const el = (id) => document.getElementById(id);
let produtosCache = [];
let adicionaisCache = [];
let pedidosCache = [];
let pedidosFechamentoAtual = [];
let itemPendenteExcluir = null;
let pedidoDetalheAtual = null;
let filtroCatalogoAtual = { tipo: null, categoria: null };

function toast(mensagem, erro = false) {
  const t = el('toast');
  if (!t) return;
  t.textContent = mensagem;
  t.classList.toggle('erro', erro);
  t.classList.add('mostrar');
  window.setTimeout(() => t.classList.remove('mostrar'), 3200);
}

function abrirModal(id) {
  const m = el(id);
  if (!m) return;
  m.removeAttribute('aria-hidden');
  m.setAttribute('data-aberto', 'true');
  document.body.style.overflow = 'hidden';
}

function fecharModal(id) {
  const m = el(id);
  if (!m) return;
  m.removeAttribute('data-aberto');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function slugify(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const app = {
  mudarView(nome, categoria = null) {
    if (nome === 'produtos' || nome === 'acompanhamentos') {
      filtroCatalogoAtual = { tipo: nome, categoria };
    }
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-view]').forEach(a => a.classList.remove('active'));
    const view = el(`view-${nome}`);
    const link = [...document.querySelectorAll('.nav-item[data-view]')].find(a => a.dataset.view === nome && (a.dataset.categoria || null) === categoria) || document.querySelector(`.nav-item[data-view="${nome}"]`);
    if (view) view.classList.add('active');
    if (link) link.classList.add('active');
    const titulo = categoria || link?.textContent?.trim().replace(/^\S+\s*/, '') || nome;
    if (el('page-title')) el('page-title').textContent = titulo;
    if (nome === 'dashboard') carregarDashboard();
    if (nome === 'produtos') carregarProdutos();
    if (nome === 'acompanhamentos') carregarAdicionais();
    if (nome === 'pedidos') carregarPedidos();
    if (nome === 'fechamento') return carregarFechamento();
  },

  exportarPedidos() {
    const linhas = [['Pedido', 'Cliente', 'Telefone', 'Endereço', 'Pagamento', 'Total', 'Status', 'Data']];
    pedidosFechamentoAtual.forEach(p => linhas.push([
      p.id, p.nome, p.telefone, p.endereco, p.pagamento, p.total, p.status, p.criado_em
    ]));
    const csv = '\uFEFF' + linhas.map(l => l.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory-acai-pedidos-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
window.app = app;
window.fecharModalPedidoDetalhes = () => fecharModal('modal-pedido-detalhes');

async function verificarAdministrador() {
  const { data: { user }, error } = await factorySupabase.auth.getUser();
  if (error || !user) { window.location.replace('index.html'); return false; }
  const { data: admin, error: adminError } = await factorySupabase.rpc('factory_is_admin');
  if (adminError || admin !== true) {
    await factorySupabase.auth.signOut();
    window.location.replace('index.html');
    return false;
  }
  return true;
}

async function carregarProdutos() {
  const tbody = el('tbody-produtos');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
  const { data, error } = await factorySupabase.from('factory_catalogo_produtos').select('*').order('ordem');
  if (error) { tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar produtos.</td></tr>'; toast(error.message, true); return; }
  produtosCache = data || [];
  const listaProdutos = filtroCatalogoAtual.categoria ? produtosCache.filter(p => p.categoria === filtroCatalogoAtual.categoria) : produtosCache;
  if (el('titulo-produtos')) el('titulo-produtos').textContent = filtroCatalogoAtual.categoria || 'Tamanhos dos Copos';
  tbody.innerHTML = listaProdutos.map(p => `<tr>
    <td class="produto-emoji-celula">${esc(p.emoji || '🫐')}</td><td>${esc(p.nome)}${p.ativo ? '' : ' (inativo)'}</td><td>${esc(p.categoria)}</td>
    <td>${moeda(p.preco)}</td><td>${esc(p.descricao)}</td>
    <td><button class="btn btn-outline" data-editar-produto="${esc(p.id)}">Editar</button>
    <button class="btn btn-danger" data-excluir-tipo="produto" data-excluir-id="${esc(p.id)}" data-excluir-nome="${esc(p.nome)}">Excluir</button></td>
  </tr>`).join('') || '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>';
}

async function carregarAdicionais() {
  const tbody = el('tbody-acompanhamentos');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
  const { data, error } = await factorySupabase.from('factory_catalogo_adicionais').select('*').order('ordem');
  if (error) { tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar adicionais.</td></tr>'; toast(error.message, true); return; }
  adicionaisCache = data || [];
  const listaAdicionais = filtroCatalogoAtual.categoria ? adicionaisCache.filter(p => p.categoria === filtroCatalogoAtual.categoria) : adicionaisCache;
  if (el('titulo-acompanhamentos')) el('titulo-acompanhamentos').textContent = filtroCatalogoAtual.categoria || 'Complementos';
  tbody.innerHTML = listaAdicionais.map(a => `<tr>
    <td>${esc(a.emoji || '➕')} ${esc(a.nome)}${a.ativo ? '' : ' (inativo)'}</td><td>${esc(a.categoria)}</td><td>${moeda(a.preco)}</td>
    <td><button class="btn btn-outline" data-editar-adicional="${esc(a.id)}">Editar</button>
    <button class="btn btn-danger" data-excluir-tipo="adicional" data-excluir-id="${esc(a.id)}" data-excluir-nome="${esc(a.nome)}">Excluir</button></td>
  </tr>`).join('') || '<tr><td colspan="4">Nenhum acompanhamento cadastrado.</td></tr>';
}

async function carregarPedidos() {
  const tbody = el('tbody-pedidos');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10">Carregando...</td></tr>';
  const { data, error } = await factorySupabase.from('pedidos').select('*').order('criado_em', { ascending: false });
  if (error) { tbody.innerHTML = '<tr><td colspan="10">Erro ao carregar pedidos.</td></tr>'; toast(error.message, true); return; }
  pedidosCache = data || [];
  // Busca observações dos itens para exibi-las diretamente nas listas de pedidos.
  const idsPedidos = pedidosCache.map(p => p.id);
  if (idsPedidos.length) {
    const { data: itensObs, error: erroItens } = await factorySupabase
      .from('itens_pedido').select('pedido_id, observacao').in('pedido_id', idsPedidos);
    if (!erroItens) {
      const porPedido = new Map();
      (itensObs || []).forEach(item => {
        const obs = String(item.observacao ?? '').trim();
        if (!obs) return;
        const lista = porPedido.get(item.pedido_id) || [];
        if (!lista.includes(obs)) lista.push(obs);
        porPedido.set(item.pedido_id, lista);
      });
      pedidosCache = pedidosCache.map(p => ({ ...p, observacoes_resumo: (porPedido.get(p.id) || []).join(' · ') }));
    }
  }
  renderTabelaPedidos(tbody, pedidosCache.filter(p => p.status !== 'Entregue'), true);
  const entregues = el('tbody-pedidos-entregues');
  if (entregues) renderTabelaPedidos(entregues, pedidosCache.filter(p => p.status === 'Entregue'), false);
}

function renderTabelaPedidos(tbody, lista, mostrarStatus) {
  tbody.innerHTML = lista.map(p => `<tr>
    <td>#${p.id}</td><td>${esc(p.nome)}</td><td>${esc(p.telefone)}</td><td>${esc(p.endereco)}</td>
    <td>${esc(p.pagamento)}</td><td>${moeda(p.total)}</td>
    <td class="pedido-observacao-celula">${p.observacoes_resumo ? esc(p.observacoes_resumo) : ''}</td>
    ${mostrarStatus ? `<td>${esc(p.status)}</td>` : ''}
    <td>${p.criado_em ? new Date(p.criado_em).toLocaleString('pt-BR') : '-'}</td>
    <td class="acoes-pedido">
      <button type="button" class="btn btn-outline" data-detalhe-pedido="${p.id}">Detalhes</button>
      <button type="button" class="btn btn-danger" data-excluir-pedido="${p.id}" data-pedido-status="${esc(p.status)}">Excluir</button>
    </td>
  </tr>`).join('') || `<tr><td colspan="${mostrarStatus ? 10 : 9}">Nenhum pedido encontrado.</td></tr>`;
}

async function excluirPedido(id) {
  const pedido = pedidosCache.find(p => Number(p.id) === Number(id));
  if (!pedido) return toast('Pedido não encontrado na lista. Atualize a página.', true);

  const avisoFinanceiro = pedido.status === 'Entregue'
    ? '\n\nATENÇÃO: este pedido já está no fechamento de caixa. Ao excluir, ele também será retirado dos totais e relatórios do caixa.'
    : '';
  const confirmado = window.confirm(`Tem certeza que deseja excluir o pedido #${pedido.id} de ${pedido.nome}? Esta ação não pode ser desfeita.${avisoFinanceiro}`);
  if (!confirmado) return;

  const { error } = await factorySupabase
    .from('pedidos')
    .delete()
    .eq('id', pedido.id);

  if (error) {
    console.error('Erro ao excluir pedido:', error);
    return toast(`Não foi possível excluir o pedido: ${error.message}`, true);
  }

  if (Number(pedidoDetalheAtual?.id) === Number(pedido.id)) {
    fecharModal('modal-pedido-detalhes');
    pedidoDetalheAtual = null;
  }

  toast(`Pedido #${pedido.id} excluído com sucesso.`);
  await Promise.all([carregarPedidos(), carregarDashboard(), carregarFechamento()]);
}

async function abrirDetalhesPedido(id) {
  const pedido = pedidosCache.find(p => Number(p.id) === Number(id));
  if (!pedido) return toast('Pedido não encontrado.', true);
  pedidoDetalheAtual = pedido;
  const ids = ['detalhe-numero','detalhe-cliente','detalhe-telefone','detalhe-endereco','detalhe-pagamento','detalhe-data','detalhe-total'];
  const vals = [pedido.id,pedido.nome,pedido.telefone,pedido.endereco,pedido.pagamento,pedido.criado_em ? new Date(pedido.criado_em).toLocaleString('pt-BR') : '-',moeda(pedido.total)];
  ids.forEach((id, i) => { if (el(id)) el(id).textContent = vals[i] ?? ''; });
  if (el('detalhe-status-select')) el('detalhe-status-select').value = pedido.status;
  if (el('detalhe-itens')) el('detalhe-itens').textContent = 'Carregando itens...';
  abrirModal('modal-pedido-detalhes');
  const { data: itens, error } = await factorySupabase.from('itens_pedido').select('*').eq('pedido_id', pedido.id).order('id');
  if (error) { if (el('detalhe-itens')) el('detalhe-itens').textContent = 'Não foi possível carregar os itens.'; return; }
  const listaItens = itens || [];
  if (el('detalhe-itens')) el('detalhe-itens').innerHTML = listaItens.map(i => {
    const complementos = Array.isArray(i.complementos) ? i.complementos.join(', ') : String(i.complementos || '').trim();
    return `<article class="pedido-item-card">
      <div class="pedido-item-linha"><strong>${Number(i.qtd)}x ${esc(i.nome)}</strong><b>${moeda(Number(i.preco) * Number(i.qtd || 1))}</b></div>
      <small>${esc(i.tamanho || '')}</small>
      ${complementos ? `<p><span>Adicionais:</span> ${esc(complementos)}</p>` : ''}
    </article>`;
  }).join('') || '<p>Nenhum item encontrado.</p>';
  const observacoes = listaItens.map(i => String(i.observacao ?? i.observacoes ?? '').trim()).filter(Boolean);
  if (el('detalhe-observacoes')) {
    el('detalhe-observacoes').textContent = observacoes.join(' | ');
    const blocoObservacoes = el('detalhe-observacoes').closest('.pedido-observacoes');
    if (blocoObservacoes) blocoObservacoes.hidden = observacoes.length === 0;
  }
}

async function salvarStatusPedido() {
  if (!pedidoDetalheAtual) return;
  const status = el('detalhe-status-select')?.value;
  if (!STATUS_PEDIDO.includes(status)) return toast('Status inválido.', true);

  const { data: atualizado, error } = await factorySupabase
    .from('pedidos')
    .update({ status })
    .eq('id', pedidoDetalheAtual.id)
    .select('id,status')
    .single();

  if (error || !atualizado) {
    console.error('Erro ao atualizar status do pedido:', error);
    return toast(`Erro ao atualizar: ${error?.message || 'pedido não encontrado ou sem permissão.'}`, true);
  }

  pedidoDetalheAtual.status = atualizado.status;
  fecharModal('modal-pedido-detalhes');
  await Promise.all([carregarPedidos(), carregarDashboard()]);

  if (status === 'Entregue') {
    // Limpa filtros anteriores para garantir que o pedido recém-entregue apareça no caixa.
    if (el('data-inicio')) el('data-inicio').value = '';
    if (el('data-fim')) el('data-fim').value = '';
    await app.mudarView('fechamento');
    toast(`Pedido #${atualizado.id} marcado como entregue e enviado ao fechamento de caixa.`);
    return;
  }

  await carregarFechamento();
  toast('Status do pedido atualizado!');
}

async function carregarDashboard() {
  const [p, a, o] = await Promise.all([
    factorySupabase.from('factory_catalogo_produtos').select('id', { count: 'exact', head: true }),
    factorySupabase.from('factory_catalogo_adicionais').select('id', { count: 'exact', head: true }),
    factorySupabase.from('pedidos').select('id,total,status')
  ]);
  if (p.error || a.error || o.error) return;
  const pedidos = o.data || [];
  if (el('stat-total-produtos')) el('stat-total-produtos').textContent = p.count || 0;
  if (el('stat-total-acompanhamentos')) el('stat-total-acompanhamentos').textContent = a.count || 0;
  if (el('stat-total-pedidos')) el('stat-total-pedidos').textContent = pedidos.length;
  if (el('stat-receita')) el('stat-receita').textContent = moeda(pedidos.filter(x => x.status !== 'Cancelado').reduce((s,x) => s + Number(x.total || 0), 0));
}

async function carregarFechamento() {
  const { data, error } = await factorySupabase
    .from('pedidos')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) return toast(`Erro ao carregar fechamento: ${error.message}`, true);
  pedidosCache = data || [];
  aplicarFiltroFechamento();
}

function aplicarFiltroFechamento() {
  const inicio = el('data-inicio')?.value;
  const fim = el('data-fim')?.value;
  const dentroDoPeriodo = p => {
    const data = p.criado_em ? new Date(p.criado_em) : null;
    const partesData = data && !Number.isNaN(data.getTime())
      ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(data)
      : [];
    const valoresData = Object.fromEntries(partesData.map(parte => [parte.type, parte.value]));
    const dia = valoresData.year ? `${valoresData.year}-${valoresData.month}-${valoresData.day}` : '';
    return (!inicio || dia >= inicio) && (!fim || dia <= fim);
  };

  // O caixa considera somente pedidos entregues. Ao salvar o status como
  // "Entregue", o pedido passa a aparecer aqui automaticamente.
  const pedidosPeriodo = pedidosCache.filter(dentroDoPeriodo);
  const lista = pedidosPeriodo.filter(p => p.status === 'Entregue');
  pedidosFechamentoAtual = lista;
  const total = lista.reduce((s,p) => s + Number(p.total || 0), 0);
  const pendentes = pedidosPeriodo.filter(p => p.status === 'Pendente').length;
  const entregues = lista.length;
  if (el('stat-total-pedidos-fechamento')) el('stat-total-pedidos-fechamento').textContent = lista.length;
  if (el('stat-receita-total-fechamento')) el('stat-receita-total-fechamento').textContent = moeda(total);
  if (el('stat-pedidos-pendentes')) el('stat-pedidos-pendentes').textContent = pendentes;
  if (el('stat-pedidos-entregues')) el('stat-pedidos-entregues').textContent = entregues;
  if (el('stat-medio-por-pedido')) el('stat-medio-por-pedido').textContent = moeda(lista.length ? total / lista.length : 0);
  const resumo = el('resumo-pagamento-lista');
  if (resumo) {
    const grupos = {};
    lista.forEach(p => { grupos[p.pagamento] = (grupos[p.pagamento] || 0) + Number(p.total || 0); });
    resumo.innerHTML = Object.entries(grupos).map(([k,v]) => `<div class="resumo-pagamento-item"><span>${esc(k)}</span><strong>${moeda(v)}</strong></div>`).join('') || '<p>Sem movimentação no período.</p>';
  }
  const tbody = el('tbody-fechamento');
  if (tbody) tbody.innerHTML = lista.map(p => `<tr><td>#${p.id}</td><td>${esc(p.nome)}</td><td>${esc(p.telefone)}</td><td>${esc(p.endereco)}</td><td>${esc(p.pagamento)}</td><td>${moeda(p.total)}</td><td>${esc(p.status)}</td><td>${p.criado_em ? new Date(p.criado_em).toLocaleString('pt-BR') : '-'}</td></tr>`).join('') || '<tr><td colspan="8">Nenhum pedido no período.</td></tr>';
}

function atualizarPreviewEmoji() {
  const valor = el('form-emoji')?.value.trim();
  const preview = el('form-emoji-preview');
  if (preview) preview.textContent = valor || '✨';
}

function abrirFormulario(tipo, item = null) {
  if (el('form-item')) el('form-item').reset();
  if (el('form-tipo')) el('form-tipo').value = tipo;
  if (el('form-id')) el('form-id').value = item?.id || '';
  if (el('form-nome')) el('form-nome').value = item?.nome || '';
  if (el('form-preco')) el('form-preco').value = item?.preco ?? '';
  if (el('form-descricao')) el('form-descricao').value = item?.descricao || '';
  if (el('form-emoji')) el('form-emoji').value = item?.emoji || (tipo === 'produto' ? '🥤' : '➕');
  atualizarPreviewEmoji();
  if (el('form-categoria')) {
    el('form-categoria').value = item?.categoria || (filtroCatalogoAtual.categoria || (tipo === 'produto' ? 'Açaí' : 'Chocolates, doces e complementos'));
  }
  if (el('modal-titulo')) el('modal-titulo').textContent = `${item ? 'Editar' : 'Novo'} ${tipo === 'produto' ? 'Produto' : 'Acompanhamento'}`;
  abrirModal('modal-form');
}

async function salvarItem(event) {
  event.preventDefault();
  const tipo = el('form-tipo')?.value;
  const nome = el('form-nome')?.value.trim();
  const preco = Number(el('form-preco')?.value);
  const categoria = el('form-categoria')?.value;
  const descricao = el('form-descricao')?.value.trim() || '';
  const emoji = el('form-emoji')?.value.trim() || (tipo === 'produto' ? '🥤' : '➕');
  const idExistente = el('form-id')?.value;
  if (!nome || !Number.isFinite(preco) || preco < 0) return toast('Informe nome e preço válidos.', true);
  const tabela = tipo === 'produto' ? 'factory_catalogo_produtos' : 'factory_catalogo_adicionais';
  const base = { id: idExistente || slugify(nome), nome, preco, categoria, ativo: true };
  const registro = tipo === 'produto'
    ? { ...base, valor: nome.match(/\d+\s*ml/i)?.[0] || nome, descricao, emoji }
    : { ...base, emoji, ordem: 100 };
  const { error } = await factorySupabase.from(tabela).upsert(registro, { onConflict: 'id' });
  if (error) return toast(`Não foi possível salvar: ${error.message}`, true);
  fecharModal('modal-form');
  toast('Item salvo com sucesso!');
  if (tipo === 'produto') await carregarProdutos(); else await carregarAdicionais();
  await carregarDashboard();
}

async function excluirItem() {
  if (!itemPendenteExcluir) return;
  const tabela = itemPendenteExcluir.tipo === 'produto' ? 'factory_catalogo_produtos' : 'factory_catalogo_adicionais';
  const { error } = await factorySupabase.from(tabela).delete().eq('id', itemPendenteExcluir.id);
  if (error) return toast(`Não foi possível excluir: ${error.message}`, true);
  fecharModal('modal-excluir');
  toast('Item excluído.');
  if (itemPendenteExcluir.tipo === 'produto') await carregarProdutos(); else await carregarAdicionais();
  itemPendenteExcluir = null;
  await carregarDashboard();
}

function vincularEventos() {
  const menuToggle = el('admin-menu-toggle');
  const backdrop = el('sidebar-backdrop');
  const fecharMenu = () => { document.body.classList.remove('sidebar-aberta'); menuToggle?.setAttribute('aria-expanded', 'false'); };
  menuToggle?.addEventListener('click', () => { const aberto = document.body.classList.toggle('sidebar-aberta'); menuToggle.setAttribute('aria-expanded', String(aberto)); });
  backdrop?.addEventListener('click', fecharMenu);
  document.querySelectorAll('.nav-item[data-view]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); app.mudarView(a.dataset.view, a.dataset.categoria || null); fecharMenu(); }));
  el('btn-logout')?.addEventListener('click', async e => { e.preventDefault(); await factorySupabase.auth.signOut(); window.location.replace('index.html'); });
  el('btn-novo-produto')?.addEventListener('click', () => abrirFormulario('produto'));
  el('btn-novo-acompanhamento')?.addEventListener('click', () => abrirFormulario('adicional'));
  el('form-item')?.addEventListener('submit', salvarItem);
  el('form-emoji')?.addEventListener('input', atualizarPreviewEmoji);
  document.querySelectorAll('[data-emoji]').forEach(btn => btn.addEventListener('click', () => { if (el('form-emoji')) { el('form-emoji').value = btn.dataset.emoji; atualizarPreviewEmoji(); } }));
  el('btn-cancelar-form')?.addEventListener('click', () => fecharModal('modal-form'));
  el('btn-cancelar-excluir')?.addEventListener('click', () => fecharModal('modal-excluir'));
  el('btn-confirmar-excluir')?.addEventListener('click', excluirItem);
  el('btn-salvar-status-detalhe')?.addEventListener('click', salvarStatusPedido);
  el('btn-filtrar-fechamento')?.addEventListener('click', aplicarFiltroFechamento);
  el('btn-limpar-filtro')?.addEventListener('click', () => { if (el('data-inicio')) el('data-inicio').value = ''; if (el('data-fim')) el('data-fim').value = ''; aplicarFiltroFechamento(); });

  document.addEventListener('click', e => {
    const editP = e.target.closest('[data-editar-produto]');
    const editA = e.target.closest('[data-editar-adicional]');
    const del = e.target.closest('[data-excluir-id]');
    const detalhe = e.target.closest('[data-detalhe-pedido]');
    const excluirPedidoBtn = e.target.closest('[data-excluir-pedido]');
    if (editP) abrirFormulario('produto', produtosCache.find(x => x.id === editP.dataset.editarProduto));
    if (editA) abrirFormulario('adicional', adicionaisCache.find(x => x.id === editA.dataset.editarAdicional));
    if (del) {
      itemPendenteExcluir = { tipo: del.dataset.excluirTipo, id: del.dataset.excluirId };
      if (el('excluir-nome')) el('excluir-nome').textContent = del.dataset.excluirNome || 'este item';
      abrirModal('modal-excluir');
    }
    if (detalhe) abrirDetalhesPedido(detalhe.dataset.detalhePedido);
    if (excluirPedidoBtn) excluirPedido(excluirPedidoBtn.dataset.excluirPedido);
  });

  document.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', () => fecharModal(b.closest('.modal')?.id)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal[data-aberto="true"]').forEach(m => fecharModal(m.id)); });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.factorySupabase) { toast('Cliente Supabase não foi carregado.', true); return; }
  const autorizado = await verificarAdministrador();
  if (!autorizado) return;
  vincularEventos();
  await Promise.all([carregarDashboard(), carregarProdutos(), carregarAdicionais(), carregarPedidos()]);
  const canal = factorySupabase.channel('factory-pedidos-admin')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, async () => {
      await carregarPedidos(); await carregarDashboard(); await carregarFechamento();
    }).subscribe();
  window.addEventListener('beforeunload', () => factorySupabase.removeChannel(canal));
});
