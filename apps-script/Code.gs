/**
 * GilVault — backend en Google Apps Script.
 *
 * Recibe las notificaciones de pago (enviadas por MacroDroid), las interpreta,
 * las clasifica y las guarda en la Google Sheet. También sirve los datos a la
 * app (PWA) y genera el reporte mensual.
 *
 * Instalación: ver README.md -> "Paso 1".
 */

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

var CATEGORIAS = [
  'Comida',
  'Salud',
  'Transporte',
  'Tiempo libre',
  'Hogar/Servicios',
  'Suscripciones',
  'Otros'
];

var HOJA_MOV = 'Movimientos';
var HOJA_REGLAS = 'Reglas';
var HOJA_PRESUP = 'Presupuestos';
var HOJA_REPORTES = 'Reportes';
var HOJA_LOG = 'Notificaciones';

// Dirección de la app publicada. Se configura con la propiedad del script APP_URL
// (Configuración del proyecto → Propiedades del script), p. ej. https://gilvault.netlify.app/
var APP_URL_DEFECTO = '';

var COLS_MOV = ['ID', 'Fecha', 'Monto', 'Lugar', 'Categoría', 'Origen', 'Texto original', 'Hash'];

/**
 * Reglas iniciales: palabra clave (se busca dentro del nombre del comercio)
 * -> categoría. Las reglas que aprendes desde la app se añaden al final de la
 * hoja "Reglas" y tienen prioridad sobre estas.
 */
var REGLAS_INICIALES = {
  'Comida': [
    'conad', 'coop ', 'esselunga', 'carrefour', 'lidl', 'eurospin', 'pam ', 'panorama',
    'despar', 'eurospar', 'interspar', 'penny', 'md spa', 'aldi', 'iper', 'tigros',
    'famila', 'bennet', 'unes ', 'crai ', 'sigma ', 'todis', 'naturasi', 'il gigante',
    'supermercat', 'alimentari', 'macelleria', 'panificio', 'panetteria', 'forno ',
    'pasticceria', 'gelateria', 'bar ', 'caffe', 'caffè', 'pizzeria', 'pizza ',
    'ristorante', 'trattoria', 'osteria', 'sushi', 'kebab', 'burger', 'mcdonald',
    'autogrill', 'starbucks', 'glovo', 'deliveroo', 'just eat', 'justeat', 'uber eats',
    'kfc ', 'old wild west', 'roadhouse', 'poke ', 'bistrot', 'enoteca', 'tabacchi bar'
  ],
  'Salud': [
    'farmacia', 'parafarmacia', 'farmac', 'ospedale', 'asl ', 'ats ', 'clinica',
    'medic', 'dentist', 'odontoiatr', 'ottica', 'optic', 'poliambulatorio',
    'laboratorio analisi', 'synlab', 'centro diagnostico', 'fisioterap', 'veterinar'
  ],
  'Transporte': [
    'trenitalia', 'italo ', 'trenord', 'atm milano', 'atm ', 'atac ', 'gtt ', 'anm ',
    'tper ', 'flixbus', 'itabus', 'uber ', 'free now', 'freenow', 'taxi', 'bolt ',
    'enjoy ', 'share now', 'sharenow', 'lime ', 'dott ', 'tier ', 'voi ', 'bird ',
    'eni ', 'enilive', 'q8', 'ip ', 'esso', 'tamoil', 'api ', 'shell', 'carburant',
    'distributore', 'telepass', 'autostrade', 'parcheggio', 'parking', 'easypark',
    'ryanair', 'easyjet', 'ita airways', 'wizz ', 'vueling', 'aeroporto', 'moby ',
    'tirrenia', 'grimaldi', 'gnv '
  ],
  'Tiempo libre': [
    'cinema', 'uci ', 'the space', 'ticketone', 'ticketmaster', 'vivaticket',
    'museo', 'teatro', 'concerto', 'steam', 'playstation', 'nintendo', 'xbox',
    'epic games', 'gamestop', 'feltrinelli', 'mondadori', 'libreria', 'decathlon',
    'palestra', 'piscina', 'virgin active', 'mcfit', 'booking', 'airbnb', 'hotel',
    'expedia', 'zalando', 'h&m', 'zara', 'primark', 'ovs', 'uniqlo', 'bowling',
    'escape room', 'parco ', 'zoo '
  ],
  'Hogar/Servicios': [
    'enel', 'a2a', 'hera ', 'iren ', 'acea', 'edison', 'eon ', 'e.on', 'sorgenia',
    'plenitude', 'tim ', 'telecom', 'vodafone', 'windtre', 'wind tre', 'iliad',
    'fastweb', 'ho mobile', 'kena ', 'very mobile', 'poste ', 'ikea', 'leroy merlin',
    'brico', 'obi ', 'mediaworld', 'unieuro', 'euronics', 'expert ', 'tigota',
    'acqua e sapone', 'condominio', 'affitto', 'lavanderia', 'ferramenta',
    'amazon'
  ],
  'Suscripciones': [
    'netflix', 'spotify', 'disney', 'prime video', 'amazon prime', 'primevideo',
    'apple.com', 'itunes', 'icloud', 'google one', 'google play', 'youtube', 'dazn ',
    'now tv', 'nowtv', 'sky ', 'paramount', 'timvision', 'infinity', 'audible',
    'kindle', 'openai', 'chatgpt', 'anthropic', 'claude.ai', 'microsoft', 'xbox game pass',
    'playstation plus', 'adobe ', 'dropbox', 'patreon', 'twitch', 'crunchyroll', 'duolingo'
  ]
};

// ---------------------------------------------------------------------------
// Instalación (ejecutar UNA vez desde el editor: función "setup")
// ---------------------------------------------------------------------------

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var mov = obtenerHoja_(HOJA_MOV, COLS_MOV);
  mov.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm');
  mov.getRange('C:C').setNumberFormat('#,##0.00 €');

  var reglas = obtenerHoja_(HOJA_REGLAS, ['Palabra clave', 'Categoría', 'Origen']);
  if (reglas.getLastRow() < 2) {
    var filas = [];
    Object.keys(REGLAS_INICIALES).forEach(function (cat) {
      REGLAS_INICIALES[cat].forEach(function (k) { filas.push([k, cat, 'inicial']); });
    });
    reglas.getRange(2, 1, filas.length, 3).setValues(filas);
  }

  var presup = obtenerHoja_(HOJA_PRESUP, ['Categoría', 'Límite mensual (€)']);
  if (presup.getLastRow() < 2) {
    presup.getRange(2, 1, CATEGORIAS.length, 2)
      .setValues(CATEGORIAS.map(function (c) { return [c, '']; }));
  }

  obtenerHoja_(HOJA_REPORTES, ['Mes', 'Generado', 'Visto', 'Datos (JSON)']);
  obtenerHoja_(HOJA_LOG, ['Recibido', 'App', 'Título', 'Texto', 'Resultado']);

  // Borra la hoja vacía por defecto si existe.
  var hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Foglio1');
  if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);

  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('TOKEN', token);
  }

  // Disparador mensual: día 1 a las 08:00 (hora de Italia) genera el reporte del mes anterior.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'generarReporteMensual') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('generarReporteMensual').timeBased().onMonthDay(1).atHour(8).create();

  Logger.log('Listo. Tu TOKEN secreto es: ' + token);
  Logger.log('Cópialo en la configuración de la app y en MacroDroid. No lo compartas.');
}

/**
 * Ejecútala DESPUÉS de implementar la aplicación web. Te envía un correo con:
 *  - un enlace que conecta la app GilVault de tu teléfono con un toque;
 *  - los valores que necesitas para MacroDroid.
 */
function conectarTelefono() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TOKEN');
  if (!token) throw new Error('Primero ejecuta la función setup.');
  var url = ScriptApp.getService().getUrl();
  if (!url) throw new Error('Primero implementa el script como Aplicación web (Implementar → Nueva implementación).');
  url = url.replace(/\/dev$/, '/exec');
  var app = props.getProperty('APP_URL') || APP_URL_DEFECTO;
  if (!app) throw new Error('Falta la propiedad APP_URL: Configuración del proyecto → Propiedades del script → APP_URL = la dirección de tu app (p. ej. https://gilvault.netlify.app/).');
  if (!/\/$/.test(app)) app += '/';
  var enlace = app + '#conectar?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(token);
  var email = Session.getEffectiveUser().getEmail();
  var html =
    '<h2>🪙 Conecta GilVault</h2>' +
    '<p><b>1.</b> Abre este enlace en tu teléfono (con Chrome):<br>' +
    '<a href="' + enlace + '" style="font-size:18px">▶ Conectar mi cofre</a></p>' +
    '<p><b>2.</b> Valores para MacroDroid (Solicitud HTTP, método POST):</p>' +
    '<p>URL:<br><code>' + url + '</code></p>' +
    '<p>Parámetros de consulta:<br>' +
    '<code>token</code> = <code>' + token + '</code><br>' +
    '<code>accion</code> = <code>notificacion</code><br>' +
    '<code>titulo</code> = texto mágico «Título de notificación»<br>' +
    '<code>texto</code> = texto mágico «Texto de notificación»</p>' +
    '<p style="color:#888">No reenvíes este correo: contiene tu token secreto.</p>';
  MailApp.sendEmail({ to: email, subject: '🪙 GilVault: conecta tu teléfono', htmlBody: html,
    body: 'Enlace: ' + enlace + '\nURL: ' + url + '\nToken: ' + token });
  Logger.log('Correo enviado a ' + email + '. Revisa tu bandeja de entrada.');
}

/** Muestra el token otra vez si lo perdiste. */
function verToken() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('TOKEN'));
}

// ---------------------------------------------------------------------------
// API web
// ---------------------------------------------------------------------------

var VERSION_BACKEND = 2;

/**
 * GET:
 *  - sin parámetros: comprobación rápida desde el navegador.
 *  - ?callback=fn&payload={...}: la misma API que POST, en formato JSONP.
 *    La app lo usa como respaldo si el navegador bloquea la vía POST.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.callback) {
    if (!/^[A-Za-z_$][\w$]{0,40}$/.test(p.callback)) return json_({ ok: false, error: 'callback inválido' });
    var body = {};
    try { body = JSON.parse(p.payload || '{}'); } catch (err) { body = {}; }
    var res = procesar_(body);
    return ContentService.createTextOutput(p.callback + '(' + JSON.stringify(res) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_({ ok: true, app: 'GilVault', version: VERSION_BACKEND, msg: 'Usa POST.' });
}

/**
 * POST: { token, accion, ...datos }.
 * La app envía JSON (Content-Type text/plain para evitar CORS preflight);
 * MacroDroid envía parámetros en la URL (?token=...&accion=notificacion&titulo=...&texto=...).
 */
function doPost(e) {
  // Acepta JSON en el cuerpo (la app) o parámetros de URL/formulario (MacroDroid).
  var body = {};
  var crudo = (e && e.postData && e.postData.contents) || '';
  if (/^\s*\{/.test(crudo)) {
    try { body = JSON.parse(crudo); } catch (err) { return json_({ ok: false, error: 'JSON inválido' }); }
  }
  var params = (e && e.parameter) || {};
  Object.keys(params).forEach(function (k) { if (body[k] === undefined) body[k] = params[k]; });
  return json_(procesar_(body));
}

/** Ejecuta una acción de la API y devuelve un objeto (nunca lanza error). */
function procesar_(body) {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || body.token !== token) return { ok: false, error: 'Token incorrecto' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    switch (body.accion) {
      case 'ping': return { ok: true, version: VERSION_BACKEND };
      case 'notificacion': return accionNotificacion_(body);
      case 'probar': return { ok: true, resultado: interpretarNotificacion(body.titulo, body.texto, new Date(), cargarReglas_()) };
      case 'datos': return accionDatos_(body);
      case 'agregar': return accionAgregar_(body);
      case 'editar': return accionEditar_(body);
      case 'borrar': return accionBorrar_(body);
      case 'reporte': return accionReporte_(body);
      case 'marcarVisto': return accionMarcarVisto_(body);
      case 'presupuestos': return accionPresupuestos_(body);
      default: return { ok: false, error: 'Acción desconocida: ' + body.accion };
    }
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  } finally {
    try { lock.releaseLock(); } catch (err) { }
  }
}

function accionNotificacion_(b) {
  var titulo = String(b.titulo || '');
  var texto = String(b.texto || '');
  var recibido = new Date();
  var log = obtenerHoja_(HOJA_LOG);

  var r = interpretarNotificacion(titulo, texto, recibido, cargarReglas_());
  if (!r.esPago) {
    log.appendRow([recibido, b.app || '', titulo, texto, 'Ignorada: ' + r.motivo]);
    return { ok: true, ignorada: true, motivo: r.motivo };
  }

  var hash = hash_(titulo + '|' + texto);
  if (esDuplicadaReciente_(log, titulo, texto, recibido)) {
    log.appendRow([recibido, b.app || '', titulo, texto, 'Duplicada']);
    return { ok: true, duplicada: true };
  }

  var id = Utilities.getUuid().slice(0, 8);
  obtenerHoja_(HOJA_MOV).appendRow([id, r.fecha, r.monto, r.lugar, r.categoria, 'notificación', titulo + ' — ' + texto, hash]);
  log.appendRow([recibido, b.app || '', titulo, texto, 'OK ' + r.monto + ' € ' + r.lugar + ' → ' + r.categoria]);
  return { ok: true, movimiento: { id: id, fecha: r.fecha.toISOString(), monto: r.monto, lugar: r.lugar, categoria: r.categoria } };
}

function accionDatos_(b) {
  var mes = b.mes || claveMes_(new Date());
  var todos = leerMovimientos_();
  var delMes = todos.filter(function (m) { return m.mes === mes; });
  var reportes = leerReportes_().map(function (r) { return { mes: r.mes, visto: r.visto }; });
  return {
    ok: true,
    mes: mes,
    categorias: CATEGORIAS,
    movimientos: delMes.map(publico_),
    presupuestos: leerPresupuestos_(),
    resumen: calcularReporte_(mes, todos, leerPresupuestos_()),
    reportes: reportes,
    meses: unicos_(todos.map(function (m) { return m.mes; }).concat([claveMes_(new Date())])).sort().reverse()
  };
}

function accionAgregar_(b) {
  var monto = Number(b.monto);
  if (!(monto > 0)) throw new Error('Monto inválido');
  var lugar = limpiarLugar_(String(b.lugar || 'Sin nombre'));
  var categoria = CATEGORIAS.indexOf(b.categoria) >= 0 ? b.categoria : clasificar(lugar, cargarReglas_());
  var fecha = b.fecha ? new Date(b.fecha) : new Date();
  var id = Utilities.getUuid().slice(0, 8);
  obtenerHoja_(HOJA_MOV).appendRow([id, fecha, monto, lugar, categoria, 'manual', '', '']);
  return { ok: true, movimiento: { id: id, fecha: fecha.toISOString(), monto: monto, lugar: lugar, categoria: categoria } };
}

function accionEditar_(b) {
  var hoja = obtenerHoja_(HOJA_MOV);
  var fila = buscarFila_(hoja, b.id);
  if (!fila) throw new Error('Movimiento no encontrado');
  if (b.monto !== undefined) hoja.getRange(fila, 3).setValue(Number(b.monto));
  if (b.lugar !== undefined) hoja.getRange(fila, 4).setValue(String(b.lugar));
  if (b.categoria !== undefined) {
    if (CATEGORIAS.indexOf(b.categoria) < 0) throw new Error('Categoría inválida');
    hoja.getRange(fila, 5).setValue(b.categoria);
  }
  if (b.fecha) hoja.getRange(fila, 2).setValue(new Date(b.fecha));

  var aprendidos = 0;
  if (b.recordar && b.categoria) {
    var clave = normalizar_(String(b.lugar !== undefined ? b.lugar : hoja.getRange(fila, 4).getValue())).trim();
    if (clave) {
      obtenerHoja_(HOJA_REGLAS).appendRow([clave, b.categoria, 'aprendida']);
      // Reclasifica también los otros movimientos de ese lugar.
      var datos = hoja.getDataRange().getValues();
      for (var i = 1; i < datos.length; i++) {
        if (normalizar_(String(datos[i][3])).indexOf(clave) >= 0 && datos[i][4] !== b.categoria) {
          hoja.getRange(i + 1, 5).setValue(b.categoria);
          aprendidos++;
        }
      }
    }
  }
  return { ok: true, reclasificados: aprendidos };
}

function accionBorrar_(b) {
  var hoja = obtenerHoja_(HOJA_MOV);
  var fila = buscarFila_(hoja, b.id);
  if (!fila) throw new Error('Movimiento no encontrado');
  hoja.deleteRow(fila);
  return { ok: true };
}

function accionReporte_(b) {
  var mes = b.mes;
  var guardado = leerReportes_().filter(function (r) { return r.mes === mes; })[0];
  if (guardado) return { ok: true, reporte: guardado.datos, cerrado: true, visto: guardado.visto };
  // Mes en curso (o sin reporte guardado): se calcula en vivo.
  return { ok: true, reporte: calcularReporte_(mes, leerMovimientos_(), leerPresupuestos_()), cerrado: false };
}

function accionMarcarVisto_(b) {
  var hoja = obtenerHoja_(HOJA_REPORTES);
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === b.mes) hoja.getRange(i + 1, 3).setValue(true);
  }
  return { ok: true };
}

function accionPresupuestos_(b) {
  var hoja = obtenerHoja_(HOJA_PRESUP);
  var p = b.presupuestos || {};
  var filas = CATEGORIAS.map(function (c) {
    var v = Number(p[c]);
    return [c, v > 0 ? v : ''];
  });
  hoja.getRange(2, 1, Math.max(hoja.getLastRow() - 1, 1), 2).clearContent();
  hoja.getRange(2, 1, filas.length, 2).setValues(filas);
  return { ok: true, presupuestos: leerPresupuestos_() };
}

// ---------------------------------------------------------------------------
// Reporte mensual (disparador automático el día 1)
// ---------------------------------------------------------------------------

function generarReporteMensual() {
  var hoy = new Date();
  var anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  generarReporte(claveMes_(anterior));
}

/** Genera (o regenera) el reporte de un mes "AAAA-MM" y te avisa. */
function generarReporte(mes) {
  var datos = calcularReporte_(mes, leerMovimientos_(), leerPresupuestos_());
  var hoja = obtenerHoja_(HOJA_REPORTES);
  var filas = hoja.getDataRange().getValues();
  for (var i = filas.length - 1; i >= 1; i--) {
    if (String(filas[i][0]) === mes) hoja.deleteRow(i + 1);
  }
  hoja.appendRow([mes, new Date(), false, JSON.stringify(datos)]);
  hoja.getRange(hoja.getLastRow(), 1).setNumberFormat('@').setValue(mes);
  avisarReporte_(mes, datos);
  return datos;
}

function avisarReporte_(mes, datos) {
  var props = PropertiesService.getScriptProperties();
  var urlApp = props.getProperty('APP_URL') || APP_URL_DEFECTO;
  var titulo = '¡Reporte de ' + nombreMes_(mes) + ' listo!';
  var cuerpo = 'Gastaste ' + formatoEuro_(datos.total) + ' en ' + datos.cantidad + ' movimientos.' +
    (datos.mayorCategoria ? ' Categoría principal: ' + datos.mayorCategoria + '.' : '');

  // 1) Notificación push vía ntfy (opcional, si configuraste NTFY_TOPIC).
  var topic = props.getProperty('NTFY_TOPIC');
  if (topic) {
    try {
      UrlFetchApp.fetch('https://ntfy.sh/' + encodeURIComponent(topic), {
        method: 'post',
        payload: cuerpo,
        headers: { 'Title': titulo, 'Tags': 'moneybag', 'Click': urlApp ? urlApp + '#reporte/' + mes : '' },
        muteHttpExceptions: true
      });
    } catch (e) { Logger.log('ntfy falló: ' + e); }
  }

  // 2) Correo a ti mismo (desactívalo poniendo AVISO_EMAIL = no).
  if (props.getProperty('AVISO_EMAIL') !== 'no') {
    var email = Session.getEffectiveUser().getEmail();
    if (email) {
      MailApp.sendEmail(email, '🪙 GilVault: ' + titulo,
        cuerpo + (urlApp ? '\n\nÁbrelo aquí: ' + urlApp + '#reporte/' + mes : '\n\nÁbrelo en la app GilVault.'));
    }
  }
}

// ---------------------------------------------------------------------------
// Lógica pura (sin dependencias de Google; se prueba con tests/parser.test.js)
// ---------------------------------------------------------------------------

/**
 * Interpreta el texto de una notificación del banco.
 * Devuelve { esPago, motivo, monto, lugar, fecha, categoria }.
 */
function interpretarNotificacion(titulo, texto, recibido, reglas) {
  var completo = (String(titulo || '') + ' \n ' + String(texto || '')).replace(/ /g, ' ');
  var n = normalizar_(completo);

  // Mensajes que NO son un gasto ya realizado.
  var ignorar = [
    [/accredit|ricevut[oa]|bonifico in entrata|rimborso|storno|refund/, 'es un ingreso o reembolso'],
    [/\botp\b|codice (di )?(sicurezza|verifica|conferma)|password|pin\b/, 'es un código de seguridad'],
    [/(autorizza|approva|conferma|confermare).{0,40}(pagamento|acquisto|operazione)|in attesa di (autorizzazione|conferma)/, 'es una solicitud de autorización (3D Secure)'],
    [/negat[oa]|rifiutat[oa]|non (e )?andat[oa] a buon fine|annullat[oa]|declined/, 'pago rechazado o anulado'],
    [/saldo (disponibile|contabile)|estratto conto/, 'es un aviso de saldo']
  ];
  for (var i = 0; i < ignorar.length; i++) {
    if (ignorar[i][0].test(n)) return { esPago: false, motivo: ignorar[i][1] };
  }

  var monto = extraerMonto_(completo);
  if (monto === null) return { esPago: false, motivo: 'no encontré un monto' };

  var esPago = /pagament|acquist|addebit|spesa|preli?ev|transazion|operazione|utilizzo|carta|pagato|hai speso|payment|purchase/.test(n);
  if (!esPago) return { esPago: false, motivo: 'no parece un pago con tarjeta' };

  // Primero el cuerpo de la notificación; el título puede contener palabras como "Da" ("Trattoria Da Gino").
  var lugar = extraerLugar_(String(texto || '').replace(/\u00a0/g, ' ')) || extraerLugar_(completo);
  if (!lugar && /preli?ev/.test(n)) lugar = 'Prelievo ATM';
  // Intesa pone el comercio también como título de la notificación.
  if (!lugar && titulo && !/intesa|sanpaolo|pagament|acquist|addebit|carta|notifica|xme|preli?ev/i.test(titulo)) {
    lugar = limpiarLugar_(titulo);
  }
  if (!lugar) lugar = 'Desconocido';

  return {
    esPago: true,
    motivo: '',
    monto: monto,
    lugar: lugar,
    fecha: extraerFecha_(completo, recibido) || recibido || new Date(),
    categoria: /preli?ev/.test(n) && lugar === 'Prelievo ATM' ? 'Otros' : clasificar(lugar, reglas)
  };
}

/** Convierte "1.234,56" / "12,50" / "12.50" / "€ 7" en número. */
function aNumero_(s) {
  s = String(s).replace(/\s/g, '');
  if (s.indexOf(',') >= 0) return Number(s.replace(/\./g, '').replace(',', '.'));
  // Solo puntos: "1.234" (miles) vs "12.50" (decimales).
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ''));
  return Number(s);
}

function extraerMonto_(t) {
  var num = '(\\d{1,3}(?:[.\\s]\\d{3})+(?:,\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)';
  var patrones = [
    new RegExp('(?:€|eur|euro)\\s*' + num, 'i'),
    new RegExp(num + '\\s*(?:€|eur\\b|euro)', 'i'),
    new RegExp('(?:importo|di|per)\\s+' + num + '(?!\\s*[/:\\d])', 'i')
  ];
  for (var i = 0; i < patrones.length; i++) {
    var m = t.match(patrones[i]);
    if (m) {
      var v = aNumero_(m[1]);
      if (v > 0 && v < 100000) return Math.round(v * 100) / 100;
    }
  }
  return null;
}

function extraerLugar_(t) {
  var fin = '(?=\\s+(?:il|in data|alle|ore|del|dalla|dal|con|con la|tramite|di importo|per un importo|carta|importo|€|eur)\\b|\\s*(?:[;,\\n€]|\\.(?:\\s|$))|\\s+\\d{2}[/.-]\\d{2}|$)';
  var patrones = [
    new RegExp('(?:\\bpresso|\\bc/o|\\besercente:?|\\bmerchant:?|\\bat)\\s+(.+?)' + fin, 'i'),
    // Formato Intesa Sanpaolo: "Hai pagato 9,99 € con la carta *1234 il 11.14 alle ore 10:05 da Iliad."
    new RegExp('\\bda\\s+(.+?)' + fin, 'i'),
    new RegExp('(?:\\bsu|\\ba)\\s+([A-Z0-9][A-Z0-9 &\'*.\\-/]{2,}?)' + fin)
  ];
  for (var i = 0; i < patrones.length; i++) {
    var m = t.match(patrones[i]);
    if (m) {
      var l = limpiarLugar_(m[1]);
      if (l && !/^\d/.test(l)) return l;
    }
  }
  return '';
}

function limpiarLugar_(s) {
  return String(s)
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'«]+|[\s"'».:,;-]+$/g, '')
    .slice(0, 60)
    .trim();
}

function extraerFecha_(t, recibido) {
  // Con año: 13/11/2026, 13-11-26, 13.11.2026 (día/mes/año).
  var m = t.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:\D{1,12}(\d{1,2})[:.](\d{2}))?/);
  if (m) {
    var anio = Number(m[3]);
    if (anio < 100) anio += 2000;
    var d = new Date(anio, Number(m[2]) - 1, Number(m[1]), m[4] ? Number(m[4]) : 12, m[5] ? Number(m[5]) : 0);
    return isNaN(d.getTime()) ? null : d;
  }
  // Sin año: "il 11.14 alle ore 13:20". Intesa usa mes.día, pero se prueban ambos
  // órdenes y se elige la fecha válida más cercana a cuando llegó la notificación.
  m = t.match(/\b(?:il|del)\s+(\d{1,2})[./-](\d{1,2})\b(?:\D{1,15}(\d{1,2})[:.](\d{2}))?/i);
  if (!m) return null;
  var ref = recibido || new Date();
  var a = Number(m[1]), b = Number(m[2]);
  var h = m[3] ? Number(m[3]) : 12, mi = m[4] ? Number(m[4]) : 0;
  var mejor = null;
  [[b, a], [a, b]].forEach(function (dm) { // [día, mes]: primero mes.día (formato Intesa)
    var dia = dm[0], mes = dm[1];
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return;
    [-1, 0, 1].forEach(function (k) {
      var f = new Date(ref.getFullYear() + k, mes - 1, dia, h, mi);
      if (f.getDate() !== dia) return; // p. ej. 31 de febrero
      var dist = Math.abs(f - ref) + (f - ref > 2 * 86400000 ? 1e12 : 0); // evita fechas futuras
      if (!mejor || dist < mejor.dist) mejor = { f: f, dist: dist };
    });
  });
  return mejor ? mejor.f : null;
}

/**
 * reglas: [{clave, categoria, aprendida}].
 * Prioridad: 1) reglas aprendidas (la más reciente gana); 2) entre las iniciales,
 * la palabra clave más larga (más específica): "uber eats" gana a "uber".
 * Una clave con espacio al inicio/final ('bar ', 'ip ') exige palabra completa.
 */
function clasificar(lugar, reglas) {
  var n = ' ' + normalizar_(lugar) + ' ';
  var mejor = null, mejorPeso = -1;
  for (var i = 0; i < reglas.length; i++) {
    var c = normalizar_(reglas[i].clave);
    var clave = c.trim();
    if (!clave) continue;
    var re = new RegExp('(^|[^a-z0-9])' + escaparRe_(clave) + (c !== clave ? '([^a-z0-9]|$)' : ''));
    if (!re.test(n)) continue;
    var peso = reglas[i].aprendida ? 1000000 + i : clave.length;
    if (peso > mejorPeso) { mejorPeso = peso; mejor = reglas[i].categoria; }
  }
  return mejor || 'Otros';
}

function reglasIniciales_() {
  var r = [];
  Object.keys(REGLAS_INICIALES).forEach(function (cat) {
    REGLAS_INICIALES[cat].forEach(function (k) { r.push({ clave: k, categoria: cat }); });
  });
  return r;
}

/** Calcula todo lo que muestra la pantalla de reporte. */
function calcularReporte_(mes, todos, presupuestos) {
  var delMes = todos.filter(function (m) { return m.mes === mes; });
  var mesAnt = mesAnterior_(mes);
  var delAnt = todos.filter(function (m) { return m.mes === mesAnt; });

  var porCat = {};
  CATEGORIAS.forEach(function (c) { porCat[c] = { categoria: c, total: 0, cantidad: 0, anterior: 0, presupuesto: presupuestos[c] || 0 }; });
  var total = 0;
  delMes.forEach(function (m) {
    var c = porCat[m.categoria] ? m.categoria : 'Otros';
    porCat[c].total += m.monto; porCat[c].cantidad++; total += m.monto;
  });
  var totalAnt = 0;
  delAnt.forEach(function (m) {
    var c = porCat[m.categoria] ? m.categoria : 'Otros';
    porCat[c].anterior += m.monto; totalAnt += m.monto;
  });

  var cats = CATEGORIAS.map(function (c) {
    var x = porCat[c];
    x.total = r2_(x.total); x.anterior = r2_(x.anterior);
    x.porcentaje = total ? Math.round(x.total / total * 1000) / 10 : 0;
    return x;
  });
  var mayor = cats.slice().sort(function (a, b) { return b.total - a.total; })[0];

  var lugares = {};
  delMes.forEach(function (m) {
    var k = m.lugar || 'Desconocido';
    lugares[k] = lugares[k] || { lugar: k, total: 0, cantidad: 0, categoria: m.categoria };
    lugares[k].total += m.monto; lugares[k].cantidad++;
  });
  var top = Object.keys(lugares).map(function (k) { lugares[k].total = r2_(lugares[k].total); return lugares[k]; })
    .sort(function (a, b) { return b.total - a.total; }).slice(0, 5);

  var mayorGasto = delMes.slice().sort(function (a, b) { return b.monto - a.monto; })[0] || null;

  // Días transcurridos (mes en curso) o días totales (mes cerrado).
  var p = mes.split('-');
  var diasMes = new Date(Number(p[0]), Number(p[1]), 0).getDate();
  var hoy = new Date();
  var dias = claveMes_(hoy) === mes ? hoy.getDate() : diasMes;

  return {
    mes: mes,
    total: r2_(total),
    cantidad: delMes.length,
    totalAnterior: r2_(totalAnt),
    variacion: totalAnt ? Math.round((total - totalAnt) / totalAnt * 1000) / 10 : null,
    promedioDiario: r2_(dias ? total / dias : 0),
    categorias: cats,
    mayorCategoria: mayor && mayor.total > 0 ? mayor.categoria : null,
    topLugares: top,
    mayorGasto: mayorGasto ? publico_(mayorGasto) : null,
    excedidos: cats.filter(function (c) { return c.presupuesto > 0 && c.total > c.presupuesto; }).map(function (c) { return c.categoria; }),
    posiblesDuplicados: detectarDuplicados_(delMes),
    recurrentes: detectarRecurrentes_(mes, todos)
  };
}

/** Mismo lugar y mismo monto el mismo día. */
function detectarDuplicados_(movs) {
  var vistos = {}, dup = [];
  movs.forEach(function (m) {
    var k = normalizar_(m.lugar) + '|' + m.monto + '|' + m.dia;
    if (vistos[k]) dup.push({ lugar: m.lugar, monto: m.monto, dia: m.dia });
    vistos[k] = true;
  });
  return dup;
}

/** Lugares cobrados en al menos 3 de los últimos 4 meses con montos parecidos (±10%). */
function detectarRecurrentes_(mes, todos) {
  var meses = [mes];
  for (var i = 0; i < 3; i++) meses.push(mesAnterior_(meses[meses.length - 1]));
  var porLugar = {};
  todos.forEach(function (m) {
    if (meses.indexOf(m.mes) < 0) return;
    var k = normalizar_(m.lugar);
    porLugar[k] = porLugar[k] || { lugar: m.lugar, meses: {}, montos: [] };
    porLugar[k].meses[m.mes] = true;
    porLugar[k].montos.push(m.monto);
  });
  return Object.keys(porLugar).map(function (k) { return porLugar[k]; }).filter(function (x) {
    if (Object.keys(x.meses).length < 3) return false;
    var prom = x.montos.reduce(function (a, b) { return a + b; }, 0) / x.montos.length;
    return x.montos.every(function (v) { return Math.abs(v - prom) <= prom * 0.1; });
  }).map(function (x) {
    return { lugar: x.lugar, montoAprox: r2_(x.montos[x.montos.length - 1]) };
  });
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function obtenerHoja_(nombre, encabezados) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    if (encabezados) {
      h.getRange(1, 1, 1, encabezados.length).setValues([encabezados]).setFontWeight('bold');
      h.setFrozenRows(1);
    }
  }
  return h;
}

function leerMovimientos_() {
  var h = obtenerHoja_(HOJA_MOV, COLS_MOV);
  if (h.getLastRow() < 2) return [];
  var tz = Session.getScriptTimeZone();
  return h.getRange(2, 1, h.getLastRow() - 1, 6).getValues()
    .filter(function (f) { return f[0] && f[2] !== ''; })
    .map(function (f) {
      var fecha = f[1] instanceof Date ? f[1] : new Date(f[1]);
      return {
        id: String(f[0]),
        fecha: fecha,
        mes: Utilities.formatDate(fecha, tz, 'yyyy-MM'),
        dia: Utilities.formatDate(fecha, tz, 'yyyy-MM-dd'),
        monto: Number(f[2]),
        lugar: String(f[3]),
        categoria: String(f[4]) || 'Otros',
        origen: String(f[5])
      };
    });
}

function publico_(m) {
  return { id: m.id, fecha: m.fecha.toISOString(), monto: m.monto, lugar: m.lugar, categoria: m.categoria, origen: m.origen };
}

function cargarReglas_() {
  var h = obtenerHoja_(HOJA_REGLAS);
  if (h.getLastRow() < 2) return reglasIniciales_();
  return h.getRange(2, 1, h.getLastRow() - 1, 3).getValues()
    .filter(function (f) { return f[0] && f[1]; })
    .map(function (f) { return { clave: String(f[0]), categoria: String(f[1]), aprendida: f[2] === 'aprendida' }; });
}

function leerPresupuestos_() {
  var h = obtenerHoja_(HOJA_PRESUP);
  var r = {};
  if (h.getLastRow() < 2) return r;
  h.getRange(2, 1, h.getLastRow() - 1, 2).getValues().forEach(function (f) {
    if (f[0] && Number(f[1]) > 0) r[String(f[0])] = Number(f[1]);
  });
  return r;
}

function leerReportes_() {
  var h = obtenerHoja_(HOJA_REPORTES);
  if (h.getLastRow() < 2) return [];
  return h.getRange(2, 1, h.getLastRow() - 1, 4).getValues().map(function (f) {
    var mes = f[0] instanceof Date ? Utilities.formatDate(f[0], Session.getScriptTimeZone(), 'yyyy-MM') : String(f[0]);
    var datos = null;
    try { datos = JSON.parse(f[3]); } catch (e) { }
    return { mes: mes, visto: f[2] === true, datos: datos };
  }).filter(function (r) { return r.datos; });
}

/** MacroDroid puede disparar dos veces por la misma notificación: misma notificación en < 5 min = duplicada. */
function esDuplicadaReciente_(log, titulo, texto, recibido) {
  var ultima = log.getLastRow();
  if (ultima < 2) return false;
  var desde = Math.max(2, ultima - 29);
  var filas = log.getRange(desde, 1, ultima - desde + 1, 5).getValues();
  return filas.some(function (f) {
    return f[2] === titulo && f[3] === texto && String(f[4]).indexOf('OK') === 0 &&
      recibido - new Date(f[0]) < 5 * 60 * 1000;
  });
}

function buscarFila_(hoja, id) {
  var ids = hoja.getRange(1, 1, hoja.getLastRow(), 1).getValues();
  for (var i = 1; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 1;
  return 0;
}

function hash_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function normalizar_(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function escaparRe_(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function r2_(n) { return Math.round(n * 100) / 100; }
function unicos_(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

function claveMes_(d) {
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
}

function mesAnterior_(mes) {
  var p = mes.split('-');
  return claveMes_(new Date(Number(p[0]), Number(p[1]) - 2, 1));
}

function nombreMes_(mes) {
  var nombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var p = mes.split('-');
  return nombres[Number(p[1]) - 1] + ' ' + p[0];
}

function formatoEuro_(n) {
  return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
}

// Exporta para los tests en Node (Apps Script ignora esto).
if (typeof module !== 'undefined') {
  module.exports = {
    interpretarNotificacion: interpretarNotificacion, clasificar: clasificar,
    reglasIniciales_: reglasIniciales_, aNumero_: aNumero_, calcularReporte_: calcularReporte_,
    CATEGORIAS: CATEGORIAS
  };
}
