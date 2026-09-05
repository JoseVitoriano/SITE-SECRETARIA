/* ==========================================================================
   Controle de Impressões — Front-end (SPA em JavaScript puro, sem frameworks)
   ========================================================================== */

/* ---------------------------- Configuração dos módulos --------------------------- */

const STATUS3 = ['HÁ INICIAR', 'EM ANDAMENTO', 'CONCLUÍDA'];
const STATUS_CRACHA = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_IMPRESSAO', label: 'Em impressão' },
  { value: 'IMPRESSO', label: 'Impresso' },
  { value: 'ENTREGUE', label: 'Entregue' },
];

function statusBadgeClass(value) {
  const map = {
    'HÁ INICIAR': 'st-ha-iniciar',
    'EM ANDAMENTO': 'st-em-andamento',
    'CONCLUÍDA': 'st-concluida',
    PENDENTE: 'st-pendente',
    EM_IMPRESSAO: 'st-em-impressao',
    IMPRESSO: 'st-impresso',
    ENTREGUE: 'st-entregue',
  };
  return map[value] || 'st-pendente';
}
function statusLabel(value) {
  const found = STATUS_CRACHA.find((s) => s.value === value);
  return found ? found.label : (value || 'HÁ INICIAR');
}
function badge(value) {
  return `<span class="badge ${statusBadgeClass(value)}"><span class="badge-dot"></span>${statusLabel(value)}</span>`;
}

const MODULES = {
  quadrante: {
    label: 'Quadrante',
    subtitle: 'Cadastro dos itens de impressão do quadrante, independente das demais abas.',
    singular: 'item do quadrante',
    api: 'quadrante',
    statusField: 'situacaoImpressao',
    statusOptions: STATUS3.map((s) => ({ value: s, label: s })),
    extraFilter: { key: 'possibilidade', label: 'Possibilidade', options: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
    fields: [
      { key: 'item', label: 'Item de impressão', type: 'text', required: true, placeholder: 'Ex: CAPA QUADRANTE' },
      { key: 'ordem', label: 'Ordem', type: 'text', list: ['ÚNICA FOLHA', 'FRENTE E VERSO'] },
      { key: 'possibilidade', label: 'Possibilidade de impressão', type: 'text', list: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
      { key: 'qtdeImpressoes', label: 'Qtde. de impressões', type: 'number' },
      { key: 'situacaoImpressao', label: 'Situação da impressão', type: 'select', options: STATUS3 },
      { key: 'posImpressao', label: 'Pós-impressão', type: 'text', list: ['PINTURA'] },
      { key: 'qtdePintados', label: 'Qtde. pintados', type: 'number' },
      { key: 'situacaoPintura', label: 'Situação da pintura', type: 'select', options: STATUS3 },
    ],
    columns: [
      { header: 'Seq', cell: (r) => `<span class="muted">${r.seq}</span>`, cls: 'col-seq' },
      { header: 'Item de impressão', cell: (r) => `<strong>${esc(r.item)}</strong>` },
      { header: 'Ordem', cell: (r) => esc(r.ordem) || '—' },
      { header: 'Possibilidade', cell: (r) => esc(r.possibilidade) || '—' },
      { header: 'Qtde.', cell: (r) => r.qtdeImpressoes ?? 0 },
      { header: 'Situação da impressão', cell: (r) => badge(r.situacaoImpressao) },
      { header: 'Situação da pintura', cell: (r) => (r.posImpressao ? badge(r.situacaoPintura) : '<span class="muted">n/a</span>') },
    ],
  },

  livros: {
    label: 'Livros de Cânticos',
    subtitle: 'Cadastro independente dos títulos e músicas do livro de cânticos.',
    singular: 'título / música',
    api: 'livros',
    statusField: 'situacaoImpressao',
    statusOptions: STATUS3.map((s) => ({ value: s, label: s })),
    extraFilter: { key: 'possibilidade', label: 'Possibilidade', options: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
    fields: [
      { key: 'titulo', label: 'Título / Música', type: 'text', required: true, placeholder: 'Ex: MENSAGEM DA LITURGIA' },
      { key: 'ordem', label: 'Ordem', type: 'text', list: ['ÚNICA FOLHA', 'FRENTE E VERSO'] },
      { key: 'possibilidade', label: 'Possibilidade de impressão', type: 'text', list: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
      { key: 'qtdeImpressoes', label: 'Qtde. de impressões', type: 'number' },
      { key: 'situacaoImpressao', label: 'Situação da impressão', type: 'select', options: STATUS3 },
    ],
    columns: [
      { header: 'Seq', cell: (r) => `<span class="muted">${r.seq}</span>`, cls: 'col-seq' },
      { header: 'Título / Música', cell: (r) => `<strong>${esc(r.titulo)}</strong>` },
      { header: 'Ordem', cell: (r) => esc(r.ordem) || '—' },
      { header: 'Possibilidade', cell: (r) => esc(r.possibilidade) || '—' },
      { header: 'Qtde.', cell: (r) => r.qtdeImpressoes ?? 0 },
      { header: 'Situação da impressão', cell: (r) => badge(r.situacaoImpressao) },
    ],
  },

  servos: {
    label: 'Crachás de Servos',
    subtitle: 'Cadastro individual dos crachás da equipe de servos.',
    singular: 'crachá de servo',
    api: 'servos',
    statusField: 'status',
    statusOptions: STATUS_CRACHA,
    extraFilter: { key: 'equipe', label: 'Equipe', dynamicFrom: 'equipe' },
    fields: [
      { key: 'nomes', label: 'Nome(s)', type: 'textarea', required: true, placeholder: 'Um ou mais nomes (um por linha)' },
      { key: 'equipe', label: 'Equipe', type: 'text', list: ['SECRETARIA', 'COORDENAÇÃO GERAL', 'LITURGIA', 'SALA', 'BATE-PAPO', 'ORDEM E LIMPEZA', 'VISITAÇÃO', 'LANCHE', 'MINIMERCADO E COMPRAS', 'COZINHA', 'GARÇONS', 'BATRAN'] },
      { key: 'possibilidade', label: 'Possibilidade de impressão', type: 'text', list: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
      { key: 'status', label: 'Status do crachá', type: 'select', options: STATUS_CRACHA },
    ],
    columns: [
      { header: 'Seq', cell: (r) => `<span class="muted">${r.seq}</span>`, cls: 'col-seq' },
      { header: 'Nome(s)', cell: (r) => `<span class="multiline"><strong>${esc(r.nomes)}</strong></span>` },
      { header: 'Equipe', cell: (r) => esc(r.equipe) || '—' },
      { header: 'Possibilidade', cell: (r) => esc(r.possibilidade) || '—' },
      { header: 'Status', cell: (r) => badge(r.status) },
    ],
  },

  jovens: {
    label: 'Crachás de Jovens',
    subtitle: 'Estrutura independente dos crachás de jovens (encontristas).',
    singular: 'crachá de jovem',
    api: 'jovens',
    statusField: 'status',
    statusOptions: STATUS_CRACHA,
    extraFilter: { key: 'circulo', label: 'Círculo', dynamicFrom: 'circulo' },
    fields: [
      { key: 'nomes', label: 'Nome(s)', type: 'textarea', required: true, placeholder: 'Um ou mais nomes (um por linha)' },
      { key: 'circulo', label: 'Círculo', type: 'text', list: ['AMARELO', 'AZUL', 'LARANJA', 'LILÁS', 'VERDE', 'VERMELHO'] },
      { key: 'possibilidade', label: 'Possibilidade de impressão', type: 'text', list: ['NAS REUNIÕES', 'SOMENTE APÓS OS CIRCULOS'] },
      { key: 'status', label: 'Status do crachá', type: 'select', options: STATUS_CRACHA },
    ],
    columns: [
      { header: 'Seq', cell: (r) => `<span class="muted">${r.seq}</span>`, cls: 'col-seq' },
      { header: 'Nome(s)', cell: (r) => `<span class="multiline"><strong>${esc(r.nomes)}</strong></span>` },
      { header: 'Círculo', cell: (r) => esc(r.circulo) || '—' },
      { header: 'Possibilidade', cell: (r) => esc(r.possibilidade) || '—' },
      { header: 'Status', cell: (r) => badge(r.status) },
    ],
  },
};

/* ---------------------------------- Utilitários ---------------------------------- */

function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtPct(n) {
  return `${(n ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function fmtNum(n) {
  return (n ?? 0).toLocaleString('pt-BR');
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch (e) {
    return iso;
  }
}

/* ------------------------------------ API ---------------------------------------- */

const api = {
  async list(moduleKey, params) {
    const qs = new URLSearchParams(params || {}).toString();
    const res = await fetch(`/api/${moduleKey}${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error('Falha ao carregar dados');
    return res.json();
  },
  async get(moduleKey, id) {
    const res = await fetch(`/api/${moduleKey}/${id}`);
    if (!res.ok) throw new Error('Registro não encontrado');
    return res.json();
  },
  async create(moduleKey, data) {
    const res = await fetch(`/api/${moduleKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Erro ao salvar');
    return body;
  },
  async update(moduleKey, id, data) {
    const res = await fetch(`/api/${moduleKey}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Erro ao salvar');
    return body;
  },
  async remove(moduleKey, id) {
    const res = await fetch(`/api/${moduleKey}/${id}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Erro ao excluir');
    return body;
  },
  async dashboard() {
    const res = await fetch('/api/dashboard');
    return res.json();
  },
};

/* ---------------------------------- Toasts / Modal -------------------------------- */

function toast(message, type = 'default') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

function openModal(innerHtml, opts = {}) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal ${opts.cls || ''}">${innerHtml}</div></div>`;
  const overlay = document.getElementById('modal-overlay');
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', escListener);
}
function escListener(e) {
  if (e.key === 'Escape') closeModal();
}
function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
  document.removeEventListener('keydown', escListener);
}

function confirmDialog(message, confirmLabel = 'Excluir') {
  return new Promise((resolve) => {
    openModal(
      `<div class="modal-header"><h3>Confirmar ação</h3></div>
       <div class="modal-body"><p>${esc(message)}</p></div>
       <div class="modal-footer">
         <button class="btn" id="cf-cancel">Cancelar</button>
         <button class="btn btn-danger" id="cf-ok">${esc(confirmLabel)}</button>
       </div>`,
      { cls: 'confirm-box' }
    );
    document.getElementById('cf-cancel').onclick = () => { closeModal(); resolve(false); };
    document.getElementById('cf-ok').onclick = () => { closeModal(); resolve(true); };
  });
}

/* ------------------------------------ Router -------------------------------------- */

const state = {
  route: 'dashboard',
  filters: {},
};

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
  return hash.split('/')[0];
}

window.addEventListener('hashchange', () => {
  state.route = parseHash();
  render();
});

function setActiveNav() {
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === state.route);
  });
}

/* ------------------------------------ Render -------------------------------------- */

async function render() {
  setActiveNav();
  const content = document.getElementById('content');
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');
  const actions = document.getElementById('topbar-actions');
  actions.innerHTML = '';

  if (state.route === 'dashboard') {
    title.textContent = 'Dashboard';
    subtitle.textContent = 'Indicadores de andamento das impressões — todas as áreas';
    content.innerHTML = '<div class="empty-state">Carregando indicadores…</div>';
    await renderDashboard(content);
  } else if (MODULES[state.route]) {
    const mod = MODULES[state.route];
    title.textContent = mod.label;
    subtitle.textContent = mod.subtitle;
    actions.innerHTML = `<button class="btn btn-primary" id="btn-novo">+ Novo cadastro</button>`;
    document.getElementById('btn-novo').onclick = () => openForm(state.route, null);
    content.innerHTML = '<div class="empty-state">Carregando registros…</div>';
    await renderModuleList(state.route, content);
  } else if (state.route === 'relatorios') {
    title.textContent = 'Relatórios';
    subtitle.textContent = 'Andamento por categoria e exportação dos dados';
    content.innerHTML = '<div class="empty-state">Carregando relatório…</div>';
    await renderRelatorios(content);
  } else {
    title.textContent = 'Não encontrado';
    subtitle.textContent = '';
    content.innerHTML = '<div class="empty-state">Página não encontrada.</div>';
  }
}

/* ----------------------------------- Dashboard ------------------------------------ */

async function renderDashboard(content) {
  let data;
  try {
    data = await api.dashboard();
  } catch (e) {
    content.innerHTML = `<div class="empty-state">Não foi possível carregar os indicadores.</div>`;
    return;
  }
  const t = data.totais;
  const cat = data.porCategoria;

  content.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard('Quadrante', fmtNum(t.totalQuadrante), 'accent-total', 'registros cadastrados')}
      ${kpiCard('Livros de Cânticos', fmtNum(t.totalLivros), 'accent-total', 'registros cadastrados')}
      ${kpiCard('Crachás de Servos', fmtNum(t.totalServos), 'accent-total', 'registros cadastrados')}
      ${kpiCard('Crachás de Jovens', fmtNum(t.totalJovens), 'accent-total', 'registros cadastrados')}
    </div>
    <div class="kpi-grid">
      ${kpiCard('Total de itens', fmtNum(t.totalItens), 'accent-total', 'nas 4 áreas')}
      ${kpiCard('Pendentes', fmtNum(t.pendentes), 'accent-pendente', 'ainda não iniciados')}
      ${kpiCard('Em impressão', fmtNum(t.emImpressao), 'accent-andamento', 'em andamento agora')}
      ${kpiCard('Impressos', fmtNum(t.impressos), 'accent-impresso', 'já impressos')}
      ${kpiCard('Entregues', fmtNum(t.entregues), 'accent-entregue', 'entregues (crachás)')}
      ${kpiCard('% concluído', fmtPct(t.percentualConcluido), 'accent-pct', 'impresso + entregue')}
    </div>

    <div class="charts-row">
      <div class="panel">
        <div class="panel-header"><h2>Volume por categoria</h2></div>
        <div class="panel-body">${barChartByCategory(cat)}</div>
      </div>
      <div class="panel">
        <div class="panel-header"><h2>Status geral</h2></div>
        <div class="panel-body">${donutChartGlobal(t)}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Andamento por categoria</h2></div>
      <div class="panel-body"><div class="category-summary">${categoryRows(cat)}</div></div>
    </div>
  `;
}

function kpiCard(label, value, accentClass, hint) {
  return `<div class="kpi-card ${accentClass}">
    <div class="kpi-label">${esc(label)}</div>
    <div class="kpi-value">${value}</div>
    <div class="kpi-hint">${esc(hint)}</div>
  </div>`;
}

const CATEGORY_META = {
  quadrante: { label: 'Quadrante', color: '#263B6B' },
  livros: { label: 'Livros de Cânticos', color: '#B8892B' },
  servos: { label: 'Crachás de Servos', color: '#2A63C7' },
  jovens: { label: 'Crachás de Jovens', color: '#2E8B57' },
};

function barChartByCategory(cat) {
  const keys = ['quadrante', 'livros', 'servos', 'jovens'];
  const maxVal = Math.max(1, ...keys.map((k) => cat[k].totalRegistros));
  const barH = 26;
  const gap = 14;
  const chartW = 460;
  const labelW = 150;
  const rows = keys.map((k, i) => {
    const total = cat[k].totalRegistros;
    const feitos = cat[k].totalFeitas > 0 ? Math.min(total, Math.round((cat[k].totalFeitas / Math.max(1, cat[k].totalImpressoes)) * total)) : 0;
    const w = (total / maxVal) * (chartW - labelW - 46);
    const wFeitos = total > 0 ? (feitos / total) * w : 0;
    const y = i * (barH + gap);
    const color = CATEGORY_META[k].color;
    return `
      <text x="0" y="${y + barH / 2 + 4}" font-size="12" fill="var(--ink-soft)">${CATEGORY_META[k].label}</text>
      <rect x="${labelW}" y="${y}" width="${Math.max(w, 2)}" height="${barH}" rx="5" fill="${color}" opacity="0.18"></rect>
      <rect x="${labelW}" y="${y}" width="${Math.max(wFeitos, total ? 3 : 0)}" height="${barH}" rx="5" fill="${color}"></rect>
      <text x="${labelW + Math.max(w, 2) + 8}" y="${y + barH / 2 + 4}" font-size="12" fill="var(--ink-faint)">${total}</text>
    `;
  }).join('');
  const svgH = keys.length * (barH + gap);
  return `
    <svg viewBox="0 0 ${chartW} ${svgH}" width="100%" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
      ${rows}
    </svg>
    <div class="legend">
      <div class="legend-item"><span class="legend-dot" style="background:var(--ink-faint);opacity:.3"></span> Total de registros</div>
      <div class="legend-item"><span class="legend-dot" style="background:var(--primary)"></span> Parcela já impressa</div>
    </div>
  `;
}

function donutChartGlobal(t) {
  const segments = [
    { label: 'Pendentes', value: t.pendentes, color: 'var(--st-pendente)' },
    { label: 'Em impressão', value: t.emImpressao, color: 'var(--st-andamento)' },
    { label: 'Impressos', value: t.impressos, color: 'var(--st-impresso)' },
    { label: 'Entregues', value: t.entregues, color: 'var(--st-entregue)' },
  ];
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const size = 180;
  const r = 66;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offsetAcc = 0;
  const circles = segments.map((seg) => {
    const frac = seg.value / total;
    const dash = frac * circumference;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="26"
      stroke-dasharray="${dash} ${circumference - dash}"
      stroke-dashoffset="${-offsetAcc}"
      transform="rotate(-90 ${cx} ${cy})" />`;
    offsetAcc += dash;
    return el;
  }).join('');

  const legend = segments.map((s) => `
    <div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label}: <b>&nbsp;${fmtNum(s.value)}</b></div>
  `).join('');

  return `
    <div style="display:flex; align-items:center; gap:18px; flex-wrap:wrap;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="26" />
        ${circles}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink)">${fmtPct((t.percentualConcluido))}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="10.5" fill="var(--ink-faint)">concluído</text>
      </svg>
      <div class="legend" style="flex-direction:column; gap:8px;">${legend}</div>
    </div>
  `;
}

function categoryRows(cat) {
  const keys = ['quadrante', 'livros', 'servos', 'jovens'];
  return keys.map((k) => {
    const c = cat[k];
    const meta = CATEGORY_META[k];
    const total = c.totalRegistros || 1;
    const pend = c.counts.pendente;
    const and = c.counts.emImpressao;
    const imp = c.counts.impresso;
    const ent = c.counts.entregue;
    return `
      <div class="cat-row">
        <div class="cat-row-top">
          <span class="cat-name">${meta.label}</span>
          <span class="cat-pct">${fmtPct(c.percentualConcluido)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-seg" style="width:${(pend/total)*100}%; background:var(--st-pendente)"></div>
          <div class="progress-seg" style="width:${(and/total)*100}%; background:var(--st-andamento)"></div>
          <div class="progress-seg" style="width:${(imp/total)*100}%; background:var(--st-impresso)"></div>
          <div class="progress-seg" style="width:${(ent/total)*100}%; background:var(--st-entregue)"></div>
        </div>
        <div class="cat-counts">
          <span>Total: <b>${c.totalRegistros}</b></span>
          <span>Pendentes: <b>${pend}</b></span>
          <span>Em impressão: <b>${and}</b></span>
          <span>Impressos: <b>${imp}</b></span>
          <span>Entregues: <b>${ent}</b></span>
        </div>
      </div>
    `;
  }).join('');
}

/* -------------------------------- Listagem de módulo ------------------------------ */

async function renderModuleList(moduleKey, content) {
  const mod = MODULES[moduleKey];
  const filters = state.filters[moduleKey] || {};

  let records;
  try {
    records = await api.list(moduleKey, filters);
  } catch (e) {
    content.innerHTML = `<div class="empty-state">Erro ao carregar os registros.</div>`;
    return;
  }

  // opções dinâmicas para o filtro extra (equipe/circulo), a partir dos próprios dados
  let extraOptions = [];
  if (mod.extraFilter) {
    if (mod.extraFilter.options) {
      extraOptions = mod.extraFilter.options;
    } else if (mod.extraFilter.dynamicFrom) {
      const all = await api.list(moduleKey, {});
      extraOptions = [...new Set(all.map((r) => r[mod.extraFilter.dynamicFrom]).filter(Boolean))].sort();
    }
  }

  const statusOptionsHtml = mod.statusOptions.map((o) => `<option value="${esc(o.value)}" ${filters.status === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('');
  const extraOptionsHtml = extraOptions.map((v) => `<option value="${esc(v)}" ${filters[mod.extraFilter.key] === v ? 'selected' : ''}>${esc(v)}</option>`).join('');

  content.innerHTML = `
    <div class="toolbar">
      <input class="field-input search-input" id="f-search" type="text" placeholder="Pesquisar em ${esc(mod.label.toLowerCase())}…" value="${esc(filters.q || '')}" />
      <select class="field-select" id="f-status">
        <option value="">Todos os status</option>
        ${statusOptionsHtml}
      </select>
      ${mod.extraFilter ? `
        <select class="field-select" id="f-extra">
          <option value="">${esc(mod.extraFilter.label)}: todos</option>
          ${extraOptionsHtml}
        </select>` : ''}
      <span class="result-count">${records.length} registro${records.length === 1 ? '' : 's'}</span>
    </div>
    <div class="panel">
      <div class="table-wrap">
        ${records.length ? dataTable(mod, records) : emptyState(mod)}
      </div>
    </div>
  `;

  document.getElementById('f-search').addEventListener('input', debounce((e) => {
    setFilter(moduleKey, 'q', e.target.value);
  }, 300));
  document.getElementById('f-status').addEventListener('change', (e) => setFilter(moduleKey, 'status', e.target.value));
  if (mod.extraFilter) {
    document.getElementById('f-extra').addEventListener('change', (e) => setFilter(moduleKey, mod.extraFilter.key, e.target.value));
  }

  content.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openForm(moduleKey, Number(btn.dataset.id)));
  });
  content.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(moduleKey, Number(btn.dataset.id), btn.dataset.name));
  });
}

function setFilter(moduleKey, key, value) {
  state.filters[moduleKey] = { ...(state.filters[moduleKey] || {}) };
  if (value) state.filters[moduleKey][key] = value;
  else delete state.filters[moduleKey][key];
  renderModuleList(moduleKey, document.getElementById('content'));
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function dataTable(mod, records) {
  const headers = mod.columns.map((c) => `<th>${esc(c.header)}</th>`).join('') + '<th></th>';
  const rows = records.map((r) => {
    const cells = mod.columns.map((c) => `<td class="${c.cls || ''}">${c.cell(r)}</td>`).join('');
    const name = r.item || r.titulo || (r.nomes ? r.nomes.split('\n')[0] : `#${r.seq}`);
    return `<tr>
      ${cells}
      <td class="col-actions">
        <button class="btn btn-sm btn-ghost" data-action="edit" data-id="${r.id}" title="Editar">✏️ Editar</button>
        <button class="btn btn-sm btn-ghost" data-action="delete" data-id="${r.id}" data-name="${esc(name)}" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
  return `<table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function emptyState(mod) {
  return `<div class="empty-state">
    <div class="empty-title">Nenhum registro encontrado</div>
    Ajuste os filtros ou cadastre um novo ${esc(mod.singular)}.
  </div>`;
}

async function handleDelete(moduleKey, id, name) {
  const ok = await confirmDialog(`Excluir "${name}"? Esta ação não pode ser desfeita.`);
  if (!ok) return;
  try {
    await api.remove(moduleKey, id);
    toast('Registro excluído.', 'success');
    renderModuleList(moduleKey, document.getElementById('content'));
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* -------------------------------- Formulário (modal) ------------------------------ */

async function openForm(moduleKey, id) {
  const mod = MODULES[moduleKey];
  let record = null;
  if (id) {
    try {
      record = await api.get(moduleKey, id);
    } catch (e) {
      toast('Registro não encontrado.', 'error');
      return;
    }
  }

  const fieldsHtml = mod.fields.map((f) => renderField(f, record)).join('');
  const historyHtml = record && record.historico && record.historico.length
    ? `<div class="field-group">
        <label>Histórico / controle de andamento</label>
        <ul class="history-list">
          ${record.historico.slice().reverse().map((h) => `<li><span class="h-date">${fmtDate(h.data)}</span> — ${esc(h.evento)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  openModal(`
    <div class="modal-header">
      <h3>${record ? `Editar ${esc(mod.singular)}` : `Novo ${esc(mod.singular)}`}</h3>
      <button class="btn btn-ghost btn-icon" id="modal-close" aria-label="Fechar">✕</button>
    </div>
    <form id="record-form">
      <div class="modal-body">
        <div class="field-error" id="form-error"></div>
        ${fieldsHtml}
        ${historyHtml}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" id="modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${record ? 'Salvar alterações' : 'Adicionar'}</button>
      </div>
    </form>
  `);

  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('modal-cancel').onclick = closeModal;
  document.getElementById('record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {};
    mod.fields.forEach((f) => {
      const el = document.getElementById(`field-${f.key}`);
      data[f.key] = f.type === 'number' ? (el.value === '' ? 0 : Number(el.value)) : el.value;
    });
    try {
      if (record) {
        await api.update(moduleKey, record.id, data);
        toast('Alterações salvas.', 'success');
      } else {
        await api.create(moduleKey, data);
        toast('Registro adicionado.', 'success');
      }
      closeModal();
      renderModuleList(moduleKey, document.getElementById('content'));
    } catch (err) {
      document.getElementById('form-error').textContent = err.message;
    }
  });
}

function renderField(f, record) {
  const value = record ? (record[f.key] ?? '') : '';
  if (f.type === 'select') {
    const opts = f.options.map((o) => {
      const v = typeof o === 'string' ? o : o.value;
      const l = typeof o === 'string' ? o : o.label;
      return `<option value="${esc(v)}" ${value === v ? 'selected' : ''}>${esc(l)}</option>`;
    }).join('');
    return `<div class="field-group">
      <label for="field-${f.key}">${esc(f.label)}</label>
      <select class="field-select" id="field-${f.key}">${opts}</select>
    </div>`;
  }
  if (f.type === 'textarea') {
    return `<div class="field-group">
      <label for="field-${f.key}">${esc(f.label)}${f.required ? ' *' : ''}</label>
      <textarea class="field-textarea" id="field-${f.key}" rows="3" placeholder="${esc(f.placeholder || '')}">${esc(value)}</textarea>
    </div>`;
  }
  const listId = f.list ? `list-${f.key}` : '';
  const datalist = f.list ? `<datalist id="${listId}">${f.list.map((v) => `<option value="${esc(v)}">`).join('')}</datalist>` : '';
  return `<div class="field-group">
    <label for="field-${f.key}">${esc(f.label)}${f.required ? ' *' : ''}</label>
    <input class="field-input" id="field-${f.key}" type="${f.type === 'number' ? 'number' : 'text'}"
      value="${esc(value)}" placeholder="${esc(f.placeholder || '')}" ${f.list ? `list="${listId}"` : ''} />
    ${datalist}
  </div>`;
}

/* ------------------------------------ Relatórios ----------------------------------- */

async function renderRelatorios(content) {
  let data;
  try {
    data = await api.dashboard();
  } catch (e) {
    content.innerHTML = `<div class="empty-state">Erro ao carregar relatório.</div>`;
    return;
  }
  const cat = data.porCategoria;

  content.innerHTML = `
    <div class="grid-2">
      <div class="panel">
        <div class="panel-header"><h2>Andamento por categoria</h2></div>
        <div class="panel-body"><div class="category-summary">${categoryRows(cat)}</div></div>
      </div>
      <div class="panel">
        <div class="panel-header"><h2>Exportar dados</h2></div>
        <div class="panel-body">
          <p class="field-hint" style="margin-top:0">Exporta uma planilha (.xls) pronta para abrir no Excel, com todos os campos de cada aba.</p>
          <div class="export-row">
            <a class="btn btn-gold" href="/api/export/geral">📊 Relatório geral (todas as abas)</a>
          </div>
          <p class="section-title" style="margin-top:18px">Por categoria</p>
          <div class="export-row">
            <a class="btn" href="/api/export/quadrante">Quadrante</a>
            <a class="btn" href="/api/export/livros">Livros de Cânticos</a>
            <a class="btn" href="/api/export/servos">Crachás de Servos</a>
            <a class="btn" href="/api/export/jovens">Crachás de Jovens</a>
          </div>
          <p class="section-title" style="margin-top:18px">Relatório em PDF</p>
          <p class="field-hint" style="margin-top:0">Abre uma versão para impressão desta página — use "Salvar como PDF" na janela de impressão do navegador.</p>
          <div class="export-row">
            <button class="btn" id="btn-print">🖨️ Imprimir / Salvar como PDF</button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:16px">
      <div class="panel-header"><h2>Impressões pendentes (todas as áreas)</h2></div>
      <div class="panel-body">${pendingAcrossAll()}</div>
    </div>
  `;

  document.getElementById('btn-print').onclick = () => window.print();
  await fillPendingTable();
}

function pendingAcrossAll() {
  return `<div id="pending-holder" class="table-wrap"><div class="empty-state">Carregando…</div></div>`;
}

async function fillPendingTable() {
  const holder = document.getElementById('pending-holder');
  const results = await Promise.all([
    api.list('quadrante', { status: 'HÁ INICIAR' }),
    api.list('livros', { status: 'HÁ INICIAR' }),
    api.list('servos', { status: 'PENDENTE' }),
    api.list('jovens', { status: 'PENDENTE' }),
  ]);
  const [q, l, s, j] = results;
  const rows = [
    ...q.map((r) => ({ categoria: 'Quadrante', nome: r.item })),
    ...l.map((r) => ({ categoria: 'Livros de Cânticos', nome: r.titulo })),
    ...s.map((r) => ({ categoria: 'Crachás de Servos', nome: r.nomes })),
    ...j.map((r) => ({ categoria: 'Crachás de Jovens', nome: r.nomes })),
  ];
  if (!rows.length) {
    holder.innerHTML = `<div class="empty-state">Nenhum item pendente 🎉</div>`;
    return;
  }
  holder.innerHTML = `<table class="data-table">
    <thead><tr><th>Categoria</th><th>Item / Nome</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${esc(r.categoria)}</td><td class="multiline">${esc(r.nome)}</td></tr>`).join('')}</tbody>
  </table>`;
}

/* -------------------------------------- Init --------------------------------------- */

state.route = parseHash();
render();
