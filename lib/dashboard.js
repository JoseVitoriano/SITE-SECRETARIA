// lib/dashboard.js
// Calcula os indicadores agregados usados no Dashboard e nos Relatórios.

const db = require('./jsonDb');

// Uniformiza os status de cada aba em 4 baldes comuns, só para fins de
// indicadores globais. Cada aba continua guardando seu próprio vocabulário
// de status internamente (isso é tratado em jsonDb.js).
function bucketQuadranteLivros(status) {
  if (status === 'CONCLUÍDA') return 'impresso';
  if (status === 'EM ANDAMENTO') return 'emImpressao';
  return 'pendente';
}

function bucketCracha(status) {
  if (status === 'ENTREGUE') return 'entregue';
  if (status === 'IMPRESSO') return 'impresso';
  if (status === 'EM_IMPRESSAO') return 'emImpressao';
  return 'pendente';
}

function emptyCounts() {
  return { pendente: 0, emImpressao: 0, impresso: 0, entregue: 0 };
}

function summarize() {
  const quadrante = db.list('quadrante');
  const livros = db.list('livros');
  const servos = db.list('servos');
  const jovens = db.list('jovens');

  const perCategoria = {};
  const global = emptyCounts();

  function process(name, records, bucketFn, qtdeField) {
    const counts = emptyCounts();
    let totalImpressoes = 0;
    let totalFeitas = 0;
    records.forEach((r) => {
      const bucket = bucketFn(qtdeField ? r.situacaoImpressao : r.status);
      counts[bucket]++;
      global[bucket]++;
      const qtde = qtdeField ? Number(r[qtdeField]) || 0 : 1;
      totalImpressoes += qtde;
      if (bucket === 'impresso' || bucket === 'entregue') totalFeitas += qtde;
    });
    const total = records.length;
    const pct = total ? ((totalFeitas / totalImpressoes || 0) * 100) : 0;
    perCategoria[name] = {
      totalRegistros: total,
      totalImpressoes,
      totalFeitas,
      percentualConcluido: Number(pct.toFixed(1)),
      counts,
    };
  }

  process('quadrante', quadrante, bucketQuadranteLivros, 'qtdeImpressoes');
  process('livros', livros, bucketQuadranteLivros, 'qtdeImpressoes');
  process('servos', servos, bucketCracha, null);
  process('jovens', jovens, bucketCracha, null);

  const totalItens =
    perCategoria.quadrante.totalRegistros +
    perCategoria.livros.totalRegistros +
    perCategoria.servos.totalRegistros +
    perCategoria.jovens.totalRegistros;

  const totalConcluidosGlobal = global.impresso + global.entregue;
  const totalGlobal = totalItens || 1;
  const percentualGlobal = Number(
    (((global.impresso + global.entregue) / totalGlobal) * 100).toFixed(1)
  );

  return {
    porCategoria: perCategoria,
    totais: {
      totalQuadrante: perCategoria.quadrante.totalRegistros,
      totalLivros: perCategoria.livros.totalRegistros,
      totalServos: perCategoria.servos.totalRegistros,
      totalJovens: perCategoria.jovens.totalRegistros,
      totalItens,
      pendentes: global.pendente,
      emImpressao: global.emImpressao,
      impressos: global.impresso,
      entregues: global.entregue,
      percentualConcluido: percentualGlobal,
    },
  };
}

module.exports = { summarize };
