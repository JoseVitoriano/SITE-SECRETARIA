// lib/xlsExport.js
// Gera arquivos .xls reais (formato SpreadsheetML 2003), abrindo direto no Excel,
// sem precisar de nenhuma biblioteca externa (xlsx/exceljs etc).

function escapeXml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cellStr(v) {
  return `<Cell><Data ss:Type="String">${escapeXml(v)}</Data></Cell>`;
}

function cellNum(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return cellStr(v);
  return `<Cell><Data ss:Type="Number">${n}</Data></Cell>`;
}

function buildSheet(name, headers, rows) {
  const headerRow = `<Row ss:StyleID="Header">${headers
    .map((h) => cellStr(h))
    .join('')}</Row>`;
  const dataRows = rows
    .map((row) => {
      const cells = row
        .map((cell) => (typeof cell === 'number' ? cellNum(cell) : cellStr(cell)))
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${headerRow}${dataRows}</Table></Worksheet>`;
}

function buildWorkbook(sheets) {
  // sheets: [{ name, headers, rows }]
  const sheetXml = sheets.map((s) => buildSheet(s.name, s.headers, s.rows)).join('');
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${sheetXml}
</Workbook>`;
}

module.exports = { buildWorkbook };
