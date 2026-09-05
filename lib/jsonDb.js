// lib/jsonDb.js
// Camada de persistência simples baseada em arquivo JSON.
// Não depende de nenhum pacote externo (sem SQLite/Mongo) para que o projeto
// rode com um único comando: `node server.js`.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-data.json');

const STATUS_QUADRANTE_LIVROS = ['HÁ INICIAR', 'EM ANDAMENTO', 'CONCLUÍDA'];
const STATUS_CRACHA = ['PENDENTE', 'EM_IMPRESSAO', 'IMPRESSO', 'ENTREGUE'];

function normalizeQuadranteLivrosStatus(v) {
  if (!v) return 'HÁ INICIAR';
  const s = String(v).trim().toUpperCase();
  if (STATUS_QUADRANTE_LIVROS.includes(s)) return s;
  return 'HÁ INICIAR';
}

function mapOriginalToChachaStatus(v) {
  if (!v) return 'PENDENTE';
  const s = String(v).trim().toUpperCase();
  if (s === 'CONCLUÍDA') return 'IMPRESSO';
  if (s === 'EM ANDAMENTO') return 'EM_IMPRESSAO';
  return 'PENDENTE';
}

function nowIso() {
  return new Date().toISOString();
}

function buildInitialDb() {
  let seed = { quadrante: [], livros: [], servos: [], jovens: [] };
  try {
    seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  } catch (e) {
    console.warn('Aviso: seed-data.json não encontrado, iniciando vazio.');
  }

  const db = {
    quadrante: [],
    livros: [],
    servos: [],
    jovens: [],
    meta: { nextId: { quadrante: 1, livros: 1, servos: 1, jovens: 1 } },
  };

  (seed.quadrante || []).forEach((r) => {
    const id = db.meta.nextId.quadrante++;
    db.quadrante.push({
      id,
      seq: r.seq ?? id,
      item: r.item || '',
      ordem: r.ordem || '',
      possibilidade: r.possibilidade || '',
      qtdeImpressoes: r.qtdeImpressoes ?? 0,
      situacaoImpressao: normalizeQuadranteLivrosStatus(r.situacaoImpressao),
      posImpressao: r.posImpressao || '',
      qtdePintados: r.qtdePintados ?? 0,
      situacaoPintura: normalizeQuadranteLivrosStatus(r.situacaoPintura),
      historico: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  });

  (seed.livros || []).forEach((r) => {
    const id = db.meta.nextId.livros++;
    db.livros.push({
      id,
      seq: r.seq ?? id,
      titulo: r.titulo || '',
      ordem: r.ordem || '',
      possibilidade: r.possibilidade || '',
      qtdeImpressoes: r.qtdeImpressoes ?? 0,
      situacaoImpressao: normalizeQuadranteLivrosStatus(r.situacaoImpressao),
      historico: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  });

  (seed.servos || []).forEach((r) => {
    const id = db.meta.nextId.servos++;
    db.servos.push({
      id,
      seq: r.seq ?? id,
      nomes: r.nomes || '',
      equipe: r.equipe || '',
      possibilidade: r.possibilidade || '',
      status: mapOriginalToChachaStatus(r.situacaoImpressao),
      historico: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  });

  (seed.jovens || []).forEach((r) => {
    const id = db.meta.nextId.jovens++;
    db.jovens.push({
      id,
      seq: r.seq ?? id,
      nomes: r.nomes || '',
      circulo: r.circulo || '',
      possibilidade: r.possibilidade || '',
      status: mapOriginalToChachaStatus(r.situacaoImpressao),
      historico: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  });

  return db;
}

let cache = null;

function load() {
  if (cache) return cache;
  if (fs.existsSync(DB_PATH)) {
    cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } else {
    cache = buildInitialDb();
    save();
  }
  return cache;
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

function list(collection) {
  return load()[collection];
}

function get(collection, id) {
  return load()[collection].find((x) => x.id === Number(id));
}

function create(collection, data) {
  const db = load();
  const id = db.meta.nextId[collection]++;
  const maxSeq = db[collection].reduce((m, r) => Math.max(m, r.seq || 0), 0);
  const record = {
    id,
    seq: data.seq || maxSeq + 1,
    ...data,
    historico: [{ data: nowIso(), evento: 'Registro criado' }],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db[collection].push(record);
  save();
  return record;
}

function update(collection, id, data) {
  const db = load();
  const idx = db[collection].findIndex((x) => x.id === Number(id));
  if (idx === -1) return null;
  const existing = db[collection][idx];

  // registra histórico de mudança de status (respeitando o campo de status de cada aba)
  const historico = existing.historico || [];
  const statusFields = ['situacaoImpressao', 'situacaoPintura', 'status'];
  statusFields.forEach((f) => {
    if (data[f] !== undefined && data[f] !== existing[f]) {
      historico.push({
        data: nowIso(),
        evento: `${f}: "${existing[f] || '—'}" → "${data[f]}"`,
      });
    }
  });

  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    historico,
    updatedAt: nowIso(),
  };
  db[collection][idx] = updated;
  save();
  return updated;
}

function remove(collection, id) {
  const db = load();
  const idx = db[collection].findIndex((x) => x.id === Number(id));
  if (idx === -1) return false;
  db[collection].splice(idx, 1);
  save();
  return true;
}

function resetFromSeed() {
  cache = buildInitialDb();
  save();
  return cache;
}

module.exports = {
  load,
  save,
  list,
  get,
  create,
  update,
  remove,
  resetFromSeed,
  STATUS_QUADRANTE_LIVROS,
  STATUS_CRACHA,
};
