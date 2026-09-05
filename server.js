// server.js
// Servidor único, sem dependências externas (usa apenas módulos nativos do Node).
// Rode com: node server.js
// Acesse:   http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const db = require('./lib/jsonDb');
const dashboard = require('./lib/dashboard');
const xlsExport = require('./lib/xlsExport');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const COLLECTIONS = {
  quadrante: {
    required: ['item'],
    numberFields: ['qtdeImpressoes', 'qtdePintados'],
  },
  livros: {
    required: ['titulo'],
    numberFields: ['qtdeImpressoes'],
  },
  servos: {
    required: ['nomes'],
    numberFields: [],
  },
  jovens: {
    required: ['nomes'],
    numberFields: [],
  },
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        reject(new Error('Payload muito grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sanitizePayload(collection, body) {
  const cfg = COLLECTIONS[collection];
  const data = { ...body };
  delete data.id;
  delete data.historico;
  delete data.createdAt;
  delete data.updatedAt;
  cfg.numberFields.forEach((f) => {
    if (data[f] !== undefined && data[f] !== null && data[f] !== '') {
      data[f] = Number(data[f]);
    }
  });
  return data;
}

function validate(collection, data) {
  const cfg = COLLECTIONS[collection];
  for (const field of cfg.required) {
    if (!data[field] || String(data[field]).trim() === '') {
      return `Campo obrigatório ausente: ${field}`;
    }
  }
  return null;
}

function matchesFilters(record, query, collection) {
  if (query.q) {
    const q = query.q.toLowerCase();
    const haystack = JSON.stringify(record).toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (query.status) {
    const statusField = collection === 'servos' || collection === 'jovens' ? 'status' : null;
    if (statusField) {
      if (record[statusField] !== query.status) return false;
    } else if (query.statusField && record[query.statusField] !== query.status) {
      return false;
    } else if (record.situacaoImpressao !== query.status) {
      return false;
    }
  }
  if (query.equipe && record.equipe !== query.equipe) return false;
  if (query.circulo && record.circulo !== query.circulo) return false;
  if (query.possibilidade && record.possibilidade !== query.possibilidade) return false;
  return true;
}

async function handleApi(req, res, parsed) {
  const segments = parsed.pathname.split('/').filter(Boolean); // ['api', 'quadrante', '3']
  const resource = segments[1];
  const id = segments[2];

  // ---- Dashboard ----
  if (resource === 'dashboard' && req.method === 'GET') {
    return sendJson(res, 200, dashboard.summarize());
  }

  // ---- Reset (volta aos dados originais da planilha) ----
  if (resource === 'reset' && req.method === 'POST') {
    db.resetFromSeed();
    return sendJson(res, 200, { ok: true });
  }

  // ---- Export XLS ----
  if (resource === 'export' && req.method === 'GET') {
    return handleExport(res, id, parsed.query);
  }

  // ---- CRUD genérico para as 4 coleções ----
  if (!COLLECTIONS[resource]) {
    return sendJson(res, 404, { error: 'Recurso não encontrado' });
  }

  if (req.method === 'GET' && !id) {
    let records = db.list(resource);
    records = records.filter((r) => matchesFilters(r, parsed.query, resource));
    records = records.slice().sort((a, b) => (a.seq || 0) - (b.seq || 0));
    return sendJson(res, 200, records);
  }

  if (req.method === 'GET' && id) {
    const record = db.get(resource, id);
    if (!record) return sendJson(res, 404, { error: 'Registro não encontrado' });
    return sendJson(res, 200, record);
  }

  if (req.method === 'POST' && !id) {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: 'JSON inválido' });
    }
    const data = sanitizePayload(resource, body);
    const err = validate(resource, data);
    if (err) return sendJson(res, 400, { error: err });
    const created = db.create(resource, data);
    return sendJson(res, 201, created);
  }

  if (req.method === 'PUT' && id) {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: 'JSON inválido' });
    }
    const data = sanitizePayload(resource, body);
    const err = validate(resource, data);
    if (err) return sendJson(res, 400, { error: err });
    const updated = db.update(resource, id, data);
    if (!updated) return sendJson(res, 404, { error: 'Registro não encontrado' });
    return sendJson(res, 200, updated);
  }

  if (req.method === 'DELETE' && id) {
    const ok = db.remove(resource, id);
    if (!ok) return sendJson(res, 404, { error: 'Registro não encontrado' });
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 405, { error: 'Método não permitido' });
}

const LABELS = {
  quadrante: {
    name: 'Quadrante',
    headers: [
      'SEQ', 'ITEM/IMPRESSÃO', 'ORDEM', 'POSSIBILIDADE DE IMPRESSÃO', 'QTDE. IMPRESSÕES',
      'SITUAÇÃO DA IMPRESSÃO', 'PÓS-IMPRESSÃO', 'QTDE. PINTADOS', 'SITUAÇÃO DA PINTURA',
    ],
    row: (r) => [r.seq, r.item, r.ordem, r.possibilidade, r.qtdeImpressoes, r.situacaoImpressao, r.posImpressao, r.qtdePintados, r.situacaoPintura],
  },
  livros: {
    name: 'Livros de Canticos',
    headers: ['SEQ', 'TÍTULO/MÚSICA', 'ORDEM', 'POSSIBILIDADE DE IMPRESSÃO', 'QTDE. IMPRESSÕES', 'SITUAÇÃO DA IMPRESSÃO'],
    row: (r) => [r.seq, r.titulo, r.ordem, r.possibilidade, r.qtdeImpressoes, r.situacaoImpressao],
  },
  servos: {
    name: 'Crachas Servos',
    headers: ['SEQ', 'NOMES', 'EQUIPE', 'POSSIBILIDADE DE IMPRESSÃO', 'STATUS'],
    row: (r) => [r.seq, r.nomes, r.equipe, r.possibilidade, r.status],
  },
  jovens: {
    name: 'Crachas Jovens',
    headers: ['SEQ', 'NOMES', 'CIRCULO', 'POSSIBILIDADE DE IMPRESSÃO', 'STATUS'],
    row: (r) => [r.seq, r.nomes, r.circulo, r.possibilidade, r.status],
  },
};

function handleExport(res, which, query) {
  let sheets = [];
  if (which === 'geral' || !which) {
    sheets = Object.keys(LABELS).map((key) => {
      const cfg = LABELS[key];
      const records = db.list(key);
      return { name: cfg.name, headers: cfg.headers, rows: records.map(cfg.row) };
    });
  } else if (LABELS[which]) {
    const cfg = LABELS[which];
    const records = db.list(which);
    sheets = [{ name: cfg.name, headers: cfg.headers, rows: records.map(cfg.row) }];
  } else {
    res.writeHead(404);
    return res.end('Relatório não encontrado');
  }

  const xml = xlsExport.buildWorkbook(sheets);
  const filename = `relatorio-${which || 'geral'}.xls`;
  res.writeHead(200, {
    'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
  res.end(xml);
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, parsed);
    } catch (e) {
      console.error(e);
      sendJson(res, 500, { error: 'Erro interno do servidor' });
    }
    return;
  }

  // Arquivos estáticos
  let filePath = path.join(PUBLIC_DIR, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  // impede path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Proibido');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html'); // SPA fallback
  }
  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`\n  Controle de Impressões rodando em http://localhost:${PORT}\n`);
});
