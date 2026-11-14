// Ejecuta: node tests/backend.test.js
// Simula Google Sheets y los servicios de Apps Script para probar el flujo completo.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert'), crypto = require('crypto');

function hoja(nombre) {
  const h = { nombre, filas: [] };
  const celda = (r, c) => (h.filas[r - 1] || [])[c - 1];
  const fijar = (r, c, v) => { while (h.filas.length < r) h.filas.push([]); h.filas[r - 1][c - 1] = v; };
  h.getLastRow = () => { for (let i = h.filas.length; i > 0; i--) if ((h.filas[i - 1] || []).some(v => v !== undefined && v !== '')) return i; return 0; };
  h.appendRow = f => { const r = h.getLastRow() + 1; f.forEach((v, i) => fijar(r, i + 1, v)); };
  h.deleteRow = r => h.filas.splice(r - 1, 1);
  h.setFrozenRows = () => { };
  h.getRange = (r, c, nr, nc) => {
    if (typeof r === 'string') return { setNumberFormat() { return this; } };
    nr = nr || 1; nc = nc || 1;
    const R = {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => { const v = celda(r + i, c + j); return v === undefined ? '' : v; })),
      getValue: () => { const v = celda(r, c); return v === undefined ? '' : v; },
      setValues: v => { v.forEach((f, i) => f.forEach((x, j) => fijar(r + i, c + j, x))); return R; },
      setValue: v => { fijar(r, c, v); return R; },
      clearContent: () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) fijar(r + i, c + j, ''); return R; },
      setNumberFormat: () => R, setFontWeight: () => R
    };
    return R;
  };
  h.getDataRange = () => h.getRange(1, 1, Math.max(h.getLastRow(), 1), Math.max(1, ...h.filas.map(f => f.length)));
  return h;
}
const hojas = {};
const props = {};
const correos = [];
const ctx = {
  module: { exports: {} }, console, Date, JSON, Math, Object, String, Number, RegExp,
  SpreadsheetApp: { getActiveSpreadsheet: () => ({
    getSheetByName: n => hojas[n] || null, insertSheet: n => (hojas[n] = hoja(n)),
    getSheets: () => Object.values(hojas), deleteSheet: () => { } }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
  LockService: { getScriptLock: () => ({ waitLock() { }, releaseLock() { } }) },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    DigestAlgorithm: { MD5: 'md5' },
    computeDigest: (a, s) => [...crypto.createHash('md5').update(s).digest()].map(b => b > 127 ? b - 256 : b),
    formatDate: (d, tz, f) => { const p = n => String(n).padStart(2, '0'); return f === 'yyyy-MM' ? `${d.getFullYear()}-${p(d.getMonth() + 1)}` : `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
  },
  Session: { getScriptTimeZone: () => 'Europe/Rome', getEffectiveUser: () => ({ getEmail: () => 'yo@example.com' }) },
  ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'js' }, createTextOutput: t => ({ setMimeType: () => ({ texto: t }) }) },
  ScriptApp: { getProjectTriggers: () => [], deleteTrigger() { }, newTrigger: () => { const b = { timeBased: () => b, onMonthDay: () => b, atHour: () => b, create: () => b }; return b; } },
  MailApp: { sendEmail: (a, s, c) => correos.push({ a, s, c }) },
  UrlFetchApp: { fetch() { } },
  Logger: { log() { } }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), ctx);

ctx.setup();
const token = props.TOKEN;
assert.ok(token && hojas.Movimientos && hojas.Reglas.getLastRow() > 100, 'setup crea hojas, reglas y token');

const post = (body, comoParams) => {
  const e = comoParams ? { parameter: body, postData: { contents: '' } } : { parameter: {}, postData: { contents: JSON.stringify(body) } };
  return JSON.parse(ctx.doPost(e).texto);
};

assert.strictEqual(post({ token: 'malo', accion: 'ping' }).ok, false, 'token incorrecto rechazado');
assert.strictEqual(post({ token, accion: 'ping' }).ok, true);

// Notificación como la manda MacroDroid (parámetros de URL), con comillas en el texto.
const n1 = post({ token, accion: 'notificacion', titulo: 'Intesa Sanpaolo', texto: 'Pagamento di 12,50 EUR presso CONAD "CITY" il 13/11/2026 alle 10:32' }, true);
assert.ok(n1.ok && n1.movimiento, 'notificación registrada: ' + JSON.stringify(n1));
assert.strictEqual(n1.movimiento.categoria, 'Comida');
// La misma notificación repetida de inmediato -> duplicada.
const n2 = post({ token, accion: 'notificacion', titulo: 'Intesa Sanpaolo', texto: 'Pagamento di 12,50 EUR presso CONAD "CITY" il 13/11/2026 alle 10:32' }, true);
assert.ok(n2.duplicada, 'duplicado detectado');
// Ingreso -> ignorado.
assert.ok(post({ token, accion: 'notificacion', titulo: 'Intesa', texto: 'Accredito bonifico di 900,00 EUR' }, true).ignorada);
// Desconocido -> Otros; luego se corrige y se aprende.
const n3 = post({ token, accion: 'notificacion', titulo: 'Intesa', texto: 'Pagamento di 30,00 EUR presso PALESTRA ZEN' }, true);
const n4 = post({ token, accion: 'notificacion', titulo: 'Intesa', texto: 'Pagamento di 30,00 EUR presso LA BOTTEGA DI ANNA il 14/11/2026' }, true);
assert.strictEqual(n4.movimiento.categoria, 'Otros');
const ed = post({ token, accion: 'editar', id: n4.movimiento.id, categoria: 'Comida', recordar: true });
assert.ok(ed.ok);
const n5 = post({ token, accion: 'notificacion', titulo: 'Intesa', texto: 'Pagamento di 8,00 EUR presso LA BOTTEGA DI ANNA il 20/11/2026' }, true);
assert.strictEqual(n5.movimiento.categoria, 'Comida', 'regla aprendida aplicada');

// Manual + presupuestos + datos del mes.
assert.ok(post({ token, accion: 'agregar', lugar: 'Mercato', monto: 5, fecha: '2026-11-15T10:00:00Z' }).ok);
assert.ok(post({ token, accion: 'presupuestos', presupuestos: { Comida: 20 } }).ok);
const d = post({ token, accion: 'datos', mes: '2026-11' });
assert.strictEqual(d.movimientos.length, 5, 'movimientos de noviembre');
assert.strictEqual(d.resumen.total, 85.5);
assert.deepStrictEqual(d.resumen.excedidos, ['Comida']);
assert.strictEqual(d.presupuestos.Comida, 20);

// Borrar.
assert.ok(post({ token, accion: 'borrar', id: n3.movimiento.id }).ok);

// Reporte mensual cerrado + aviso por correo + marcar visto.
ctx.generarReporte('2026-11');
assert.strictEqual(correos.length, 1, 'correo de aviso enviado');
let rep = post({ token, accion: 'reporte', mes: '2026-11' });
assert.ok(rep.cerrado && rep.visto === false && rep.reporte.total === 55.5);
assert.strictEqual(post({ token, accion: 'datos', mes: '2026-11' }).reportes[0].visto, false);
post({ token, accion: 'marcarVisto', mes: '2026-11' });
assert.strictEqual(post({ token, accion: 'reporte', mes: '2026-11' }).visto, true);

// Probar (no guarda).
const antes = hojas.Movimientos.getLastRow();
const pr = post({ token, accion: 'probar', titulo: 'x', texto: 'Pagamento di 3,00 EUR presso FARMACIA' });
assert.ok(pr.resultado.esPago && hojas.Movimientos.getLastRow() === antes);

// JSONP (vía de respaldo de la app).
const js = ctx.doGet({ parameter: { callback: 'gv_cb1', payload: JSON.stringify({ token, accion: 'ping' }) } }).texto;
assert.ok(/^gv_cb1\(\{"ok":true/.test(js), 'JSONP responde: ' + js);
assert.ok(/Token incorrecto/.test(ctx.doGet({ parameter: { callback: 'x', payload: '{"token":"no"}' } }).texto));
assert.ok(/callback inválido/.test(ctx.doGet({ parameter: { callback: 'alert(1)//' } }).texto));
assert.strictEqual(JSON.parse(ctx.doGet({ parameter: {} }).texto).version, 3);
// MacroDroid por GET, con espacios sobrantes en token y accion.
const g1 = JSON.parse(ctx.doGet({ parameter: { token: ' ' + token + ' ', accion: 'notificacion ', titulo: 'Bar', texto: 'Hai pagato 2,50 € con la carta *1234 il 11.21 alle ore 08:00 da Bar Roma.' } }).texto);
assert.ok(g1.ok && g1.movimiento && g1.movimiento.monto === 2.5, 'GET registra: ' + JSON.stringify(g1));
// Rechazos anotados en la hoja Notificaciones.
const nLog = hojas.Notificaciones.getLastRow();
ctx.doGet({ parameter: { token: 'malo', accion: 'notificacion', titulo: 'x', texto: 'y' } });
ctx.doGet({ parameter: { token, accion: 'notificación', titulo: 'x', texto: 'y' } });
assert.strictEqual(hojas.Notificaciones.getLastRow(), nLog + 2, 'rechazos anotados');

console.log('Backend: todas las pruebas OK');
