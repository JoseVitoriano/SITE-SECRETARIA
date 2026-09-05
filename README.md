# Controle de Impressões — Equipe de Secretaria

Aplicação web (full stack) para substituir a planilha `Controle_de_Impressões_-_Secretária.xlsm`,
mantendo as 4 abas como cadastros **independentes** (nada se mistura entre elas):

- **Quadrante**
- **Livros de Cânticos**
- **Crachás de Servos**
- **Crachás de Jovens**

Inclui um **Dashboard** com indicadores gerais e gráficos, e uma seção de **Relatórios**
com exportação para Excel (.xls) e impressão em PDF.

## Como rodar

Não precisa instalar nada (zero dependências externas — só usa o Node.js nativo).

```bash
node server.js
```

Depois acesse **http://localhost:3000** no navegador.

> Requisito: Node.js 16 ou superior instalado na máquina.

## Onde ficam os dados

Os dados ficam salvos em `data/db.json`, criado automaticamente na primeira vez que o
servidor roda, com os dados já importados da planilha original (`data/seed-data.json`).

A partir daí, todo cadastro, edição e exclusão feito pela aplicação é salvo direto nesse
arquivo — não precisa de banco de dados externo.

Se quiser **voltar aos dados originais da planilha**, pare o servidor, apague o arquivo
`data/db.json` e rode `node server.js` novamente (ele recria a partir do seed).

## Estrutura do projeto

```
server.js              → servidor HTTP + rotas da API (Node puro, sem Express)
lib/jsonDb.js           → persistência dos dados em JSON (criar/ler/editar/excluir)
lib/dashboard.js        → cálculo dos indicadores do Dashboard/Relatórios
lib/xlsExport.js        → geração dos arquivos .xls de exportação
data/seed-data.json     → dados originais extraídos da planilha (usados só na 1ª execução)
data/db.json            → banco de dados atual da aplicação (gerado automaticamente)
public/                 → front-end (HTML, CSS, JS puro — SPA com roteamento por hash)
```

## Funcionalidades por área

Cada uma das 4 áreas tem sua própria tela, com:
- Listagem com pesquisa e filtros (status + um filtro extra específico da área)
- Adicionar novo cadastro
- Editar cadastro existente
- Excluir (com confirmação)
- Histórico de mudanças de status por registro

### Quadrante e Livros de Cânticos
Mantêm o mesmo vocabulário de status da planilha original: **HÁ INICIAR → EM ANDAMENTO → CONCLUÍDA**
(o Quadrante ainda controla separadamente a situação da pintura, como na aba original).

### Crachás de Servos e Crachás de Jovens
Usam o fluxo de status solicitado: **Pendente → Em impressão → Impresso → Entregue**.

## Dashboard

Mostra: total por categoria, total geral de itens, pendentes, em impressão, impressos,
entregues e % concluído — além de um gráfico de volume por categoria e um gráfico de
status geral (pizza/rosca), tudo calculado em tempo real a partir dos dados atuais.

## Relatórios

- Andamento por categoria (com barra de progresso e contagem de cada status)
- Lista consolidada de tudo que está pendente nas 4 áreas
- Exportação para Excel (.xls) — geral (todas as abas) ou por categoria
- Exportação para PDF — usa a função de impressão do navegador ("Imprimir → Salvar como PDF"),
  já com um layout limpo para impressão

## API (para referência)

Todas as rotas abaixo existem para os 4 recursos: `quadrante`, `livros`, `servos`, `jovens`.

| Método | Rota                     | Ação                          |
|--------|--------------------------|-------------------------------|
| GET    | /api/:recurso            | Lista (aceita `?q=`, `?status=`, filtros extras) |
| GET    | /api/:recurso/:id        | Detalhe de um registro        |
| POST   | /api/:recurso            | Cria novo registro             |
| PUT    | /api/:recurso/:id        | Atualiza um registro           |
| DELETE | /api/:recurso/:id        | Exclui um registro             |
| GET    | /api/dashboard           | Indicadores agregados          |
| GET    | /api/export/:recurso     | Exporta .xls (ou `geral` para tudo) |
| POST   | /api/reset               | Restaura os dados originais da planilha |
