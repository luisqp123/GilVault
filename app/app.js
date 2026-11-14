// GilVault — app principal.
(function () {
  'use strict';

  const CATS = ['Comida', 'Salud', 'Transporte', 'Tiempo libre', 'Hogar/Servicios', 'Suscripciones', 'Otros'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal');
  const $toast = document.getElementById('toast');

  // ---------------------------------------------------------------- utilidades
  const ls = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const claveMes = d => d.getFullYear() + '-' + pad(d.getMonth() + 1);
  const mesHoy = () => claveMes(new Date());
  const desplazarMes = (mes, n) => { const [a, m] = mes.split('-').map(Number); return claveMes(new Date(a, m - 1 + n, 1)); };
  const nombreMes = (mes, corto) => { const [a, m] = mes.split('-'); const n = MESES[Number(m) - 1]; return (corto ? n.slice(0, 3) : n) + ' ' + a; };
  function euros(n) {
    const neg = n < 0; n = Math.abs(Number(n) || 0);
    const [ent, dec] = n.toFixed(2).split('.');
    return (neg ? '-' : '') + ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + dec + ' €';
  }
  const fechaCorta = iso => { const d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const sp = (nombre, clase) => `<span class="sprite ${clase || ''}">${Sprites.svg(nombre)}</span>`;
  const aLocalInput = iso => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  // Cursor de manita como variable CSS.
  document.documentElement.style.setProperty('--mano', `url("data:image/svg+xml,${encodeURIComponent(Sprites.svg('mano'))}")`);

  // ---------------------------------------------------------------- sonido 8-bit
  let audio = null;
  function tono(frecs, dur, tipo) {
    if (!ls.get('gv_sonido', true)) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let t = audio.currentTime;
      frecs.forEach(f => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = tipo || 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(audio.destination); o.start(t); o.stop(t + dur);
        t += dur * 0.9;
      });
    } catch (e) { }
  }
  const sfx = {
    cursor: () => tono([1046], 0.04),
    ok: () => tono([784, 1175], 0.07),
    error: () => tono([196, 147], 0.12, 'sawtooth'),
    tesoro: () => tono([523, 659, 784, 1046, 784, 1046], 0.09)
  };

  // ---------------------------------------------------------------- API
  const config = () => ({ url: ls.get('gv_url', ''), token: ls.get('gv_token', '') });
  const enDemo = () => !config().url;
  const claveCache = mes => 'gv_cache_' + (enDemo() ? 'demo_' : '') + mes;

  // Dos vías para hablar con Apps Script: POST (fetch) y, si el navegador la bloquea,
  // JSONP (una etiqueta <script> con GET), que no depende de CORS.
  async function api(accion, datos) {
    if (enDemo()) return Demo.llamar(accion, datos);
    const { url, token } = config();
    const body = Object.assign({ token, accion }, datos || {});
    let j;
    if (ls.get('gv_via', 'post') === 'jsonp') {
      j = await jsonp(url, body);
    } else {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
          redirect: 'follow'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        j = await res.json();
      } catch (ePost) {
        try {
          j = await jsonp(url, body);
          ls.set('gv_via', 'jsonp'); // esta vía funciona: usarla desde ahora
        } catch (eJsonp) {
          throw new Error(`No pude conectar con tu script de Google (POST: ${ePost.message} · respaldo: ${eJsonp.message})`);
        }
      }
    }
    if (!j || !j.ok) throw new Error((j && j.error) || 'Respuesta vacía del script');
    return j;
  }

  let nJsonp = 0;
  function jsonp(url, body) {
    return new Promise((resolve, reject) => {
      const cb = 'gv_cb_' + Date.now() + '_' + (nJsonp++);
      const s = document.createElement('script');
      const fin = () => { clearTimeout(t); delete window[cb]; s.remove(); };
      const t = setTimeout(() => { fin(); reject(new Error('tiempo de espera agotado')); }, 25000);
      window[cb] = r => { fin(); resolve(r); };
      s.onerror = () => { fin(); reject(new Error('el script no respondió (¿falta actualizar el código o un bloqueador lo impide?)')); };
      s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb + '&payload=' + encodeURIComponent(JSON.stringify(body));
      document.head.appendChild(s);
    });
  }

  // ---------------------------------------------------------------- estado
  const st = {
    mes: mesHoy(),
    datos: null,
    offline: false,
    filtro: null,
    menuSel: ls.get('gv_menu', 0),
    avisado: {}
  };

  async function cargarDatos(silencioso) {
    if (!silencioso && !st.datos) render();
    try {
      const d = await api('datos', { mes: st.mes });
      st.datos = d; st.offline = false; st.error = null;
      ls.set(claveCache(st.mes), d);
    } catch (e) {
      const c = ls.get(claveCache(st.mes), null);
      st.datos = c; st.offline = true; st.error = e.message;
      if (c) toast('Sin conexión: ' + e.message, true);
    }
    render();
    avisarReporteNuevo();
  }

  // ---------------------------------------------------------------- navegación
  function ruta() {
    const h = location.hash.replace(/^#\/?/, '');
    const [vista, arg] = h.split('/');
    return { vista: vista || 'inicio', arg };
  }
  const ir = h => { location.hash = h; };
  window.addEventListener('hashchange', () => { cerrarModal(); render(); window.scrollTo(0, 0); });

  // ---------------------------------------------------------------- render
  function render() {
    const { vista, arg } = ruta();
    if (!st.datos && vista === 'config') {
      // Config debe abrirse siempre, aunque no haya datos (para poder arreglar la conexión).
      $app.innerHTML = avisos() + vConfig() + `<div class="pie">GILVAULT v1</div>`;
      return;
    }
    if (!st.datos && st.error) {
      $app.innerHTML = `<div class="win" style="margin-top:12vh">
        <div style="width:72px;margin:0 auto 8px">${sp('cofre', 'xl')}</div>
        <p class="px rojo" style="text-align:center">¡El cofre no se abre!</p>
        <p style="overflow-wrap:anywhere">${esc(st.error)}</p>
        <p class="dim" style="font-size:18px">Revisa en Config que la URL termine en /exec y que el token sea el del correo. Si acabas de actualizar el script, crea una <b>nueva versión</b> de la implementación.</p>
        <div class="botones"><button class="btn oro" data-accion="reintentar">Reintentar</button><button class="btn" data-ir="config">Config</button></div>
        <div class="botones"><button class="btn" data-accion="desconectar">Usar modo demo</button></div>
      </div>`;
      return;
    }
    if (!st.datos) {
      $app.innerHTML = `<div class="win" style="margin-top:40vh;text-align:center"><span class="px cargando">Abriendo el cofre</span></div>`;
      return;
    }
    const vistas = { inicio: vInicio, objetos: vObjetos, categorias: vCategorias, reporte: arg ? () => vReporte(arg) : vReportes, anadir: vAnadir, config: vConfig };
    $app.innerHTML = avisos() + (vistas[vista] || vInicio)() + `<div class="pie">GILVAULT v1</div>`;
  }

  function avisos() {
    let h = '';
    if (enDemo()) h += `<div class="aviso">MODO DEMO · datos de ejemplo. Conecta tu Google Sheet en CONFIG.</div>`;
    if (st.offline) h += `<div class="aviso">SIN CONEXIÓN · mostrando la última copia guardada.</div>`;
    return h;
  }

  function cabecera(titulo, conMes) {
    return `<div class="win fila">
      <button class="btn mini" data-ir="inicio" aria-label="Volver">◀</button>
      <h1 class="titulo grow" style="margin:0">${esc(titulo)}</h1>
      ${conMes ? `<span class="px dim">${esc(nombreMes(st.mes, true)).toUpperCase()}</span>` : ''}
    </div>`;
  }

  function barraHP(gastado, limite) {
    const resto = Math.max(0, limite - gastado);
    const pct = limite ? Math.max(0, Math.min(100, resto / limite * 100)) : 0;
    const clase = pct <= 15 ? 'bajo' : pct <= 40 ? 'medio' : '';
    return `<div class="hp ${clase}"><div class="lbl"><span class="dim">HP</span><span class="num">${gastado > limite ? '<span class="rojo">¡K.O.!</span> ' : ''}${euros(resto)} / ${euros(limite)}</span></div>
      <div class="barra"><i style="width:${pct}%"></i></div></div>`;
  }

  // ----- Inicio (menú principal)
  function vInicio() {
    const d = st.datos, r = d.resumen;
    const limites = Object.values(d.presupuestos || {}).reduce((a, b) => a + b, 0);
    const [a, m] = st.mes.split('-').map(Number);
    const diasMes = new Date(a, m, 0).getDate();
    const diasRestan = st.mes === mesHoy() ? diasMes - new Date().getDate() : 0;
    const nuevos = (d.reportes || []).filter(x => !x.visto).length;
    const opciones = [
      ['objetos', 'Objetos', ''],
      ['categorias', 'Categorías', ''],
      ['reporte', 'Reporte', nuevos ? '<span class="badge">NUEVO</span>' : ''],
      ['anadir', 'Añadir', ''],
      ['config', 'Config', '']
    ];
    const ultimos = d.movimientos.slice().sort((x, y) => new Date(y.fecha) - new Date(x.fecha)).slice(0, 4);
    return `
      <section class="win">
        <div class="mesnav">
          <button class="btn mini" data-mes="-1" aria-label="Mes anterior">◀</button>
          <span class="px">${esc(nombreMes(st.mes)).toUpperCase()}</span>
          <button class="btn mini" data-mes="1" aria-label="Mes siguiente" ${st.mes >= mesHoy() ? 'disabled style="opacity:.3"' : ''}>▶</button>
        </div>
        <div class="estado">
          ${sp('cofre', 'g')}
          <div>
            <div class="stat"><span class="k">Gastado</span><span class="num oro">${euros(r.total)}</span></div>
            <div class="stat"><span class="k">Objetos</span><span class="num">${r.cantidad}</span></div>
            <div class="stat"><span class="k">Media/día</span><span class="num">${euros(r.promedioDiario)}</span></div>
          </div>
        </div>
        ${limites ? barraHP(r.total, limites) : ''}
      </section>
      <nav class="win" aria-label="Menú">
        <ul class="menu">
          ${opciones.map(([id, txt, extra], i) => `<li><button class="item px ${i === st.menuSel ? 'sel' : ''}" data-menu="${i}" data-ir="${id}">${txt}${extra}</button></li>`).join('')}
        </ul>
      </nav>
      <section class="win">
        <h2 class="titulo">Último botín</h2>
        ${ultimos.length ? `<ul class="menu">${ultimos.map(filaMov).join('')}</ul>` : `<div class="vacio">El cofre está vacío este mes.</div>`}
      </section>
      <section class="win fila barra-inferior">
        <div class="grow"><div class="stat"><span class="k">Días</span><span class="num">${diasRestan}</span></div></div>
        <div class="grow"><div class="stat"><span class="k">Resto</span><span class="num ${limites && r.total > limites ? 'rojo' : 'oro'}">${limites ? euros(limites - r.total) : '—'}</span></div></div>
      </section>`;
  }

  function filaMov(m) {
    return `<li><button class="item" data-mov="${esc(m.id)}">
      ${sp(m.categoria)}
      <span class="grow trunc">${esc(m.lugar)}<span class="sub">${fechaCorta(m.fecha)} · ${esc(m.categoria)}</span></span>
      <span class="monto num">${euros(m.monto)}</span></button></li>`;
  }

  // ----- Objetos (lista de gastos)
  function vObjetos() {
    const movs = st.datos.movimientos
      .filter(m => !st.filtro || m.categoria === st.filtro)
      .sort((x, y) => new Date(y.fecha) - new Date(x.fecha));
    let html = '', diaAct = '';
    movs.forEach(m => {
      const d = new Date(m.fecha);
      const dia = pad(d.getDate()) + ' ' + MESES[d.getMonth()].toUpperCase();
      if (dia !== diaAct) { html += `${diaAct ? '</ul>' : ''}<div class="dia">${dia}</div><ul class="menu">`; diaAct = dia; }
      html += filaMov(m);
    });
    if (diaAct) html += '</ul>';
    const total = movs.reduce((s, m) => s + m.monto, 0);
    return cabecera('Objetos', true) + `
      <div class="win">
        <div class="filtros">
          <button class="chip ${!st.filtro ? 'on' : ''}" data-filtro="">Todo</button>
          ${CATS.map(c => `<button class="chip ${st.filtro === c ? 'on' : ''}" data-filtro="${esc(c)}">${sp(c)}${esc(c.split('/')[0])}</button>`).join('')}
        </div>
        <div class="stat" style="margin:8px 6px 0"><span class="k">${movs.length} objetos</span><span class="num oro">${euros(total)}</span></div>
        ${html || '<div class="vacio">Inventario vacío.</div>'}
      </div>`;
  }

  // ----- Categorías
  function vCategorias() {
    const r = st.datos.resumen, pres = st.datos.presupuestos || {};
    return cabecera('Categorías', true) + `<div class="win"><ul class="menu">
      ${r.categorias.map(c => `<li><button class="item" data-cat="${esc(c.categoria)}" style="flex-wrap:wrap">
        ${sp(c.categoria)}
        <span class="grow">${esc(c.categoria)}<span class="sub">${c.cantidad} objeto${c.cantidad === 1 ? '' : 's'} · ${c.porcentaje}%</span></span>
        <span class="monto num oro">${euros(c.total)}</span>
        ${pres[c.categoria] ? `<span style="flex-basis:100%">${barraHP(c.total, pres[c.categoria])}</span>` : ''}
      </button></li>`).join('')}
    </ul><p class="dim" style="font-size:18px;margin:10px 6px 0">Define presupuestos (HP) en CONFIG.</p></div>`;
  }

  // ----- Lista de reportes
  function vReportes() {
    const reps = {};
    (st.datos.reportes || []).forEach(r => reps[r.mes] = r);
    const meses = [...new Set([mesHoy()].concat(st.datos.meses || [], Object.keys(reps)))].sort().reverse();
    return cabecera('Reportes') + `<div class="win"><ul class="menu">
      ${meses.map(m => `<li><button class="item" data-ir="reporte/${m}">
        ${sp(reps[m] ? 'Suscripciones' : 'gil')}
        <span class="grow">${esc(nombreMes(m))}<span class="sub">${m === mesHoy() ? 'En curso' : reps[m] ? 'Cerrado' : 'Calculado al vuelo'}</span></span>
        ${reps[m] && !reps[m].visto ? '<span class="badge">NUEVO</span>' : ''}
      </button></li>`).join('')}
    </ul></div>`;
  }

  // ----- Reporte de un mes ("Resumen de batalla")
  const cacheRep = {};
  function vReporte(mes) {
    const r = cacheRep[mes];
    if (!r) {
      api('reporte', { mes }).then(j => {
        cacheRep[mes] = j;
        if (j.cerrado && !j.visto) {
          sfx.tesoro();
          api('marcarVisto', { mes }).then(() => {
            (st.datos.reportes || []).forEach(x => { if (x.mes === mes) x.visto = true; });
          }).catch(() => { });
        }
        if (ruta().arg === mes) render();
      }).catch(e => { toast(e.message, true); });
      return cabecera('Reporte') + `<div class="win"><span class="px cargando">Contando giles</span></div>`;
    }
    const d = r.reporte;
    const max = Math.max(1, ...d.categorias.map(c => c.total));
    const varTxt = d.variacion === null ? '<span class="dim">sin datos del mes anterior</span>'
      : `<span class="${d.variacion > 0 ? 'rojo' : 'verde'}">${d.variacion > 0 ? '▲' : '▼'} ${Math.abs(d.variacion)}%</span> <span class="dim">vs ${esc(MESES[Number(desplazarMes(mes, -1).split('-')[1]) - 1])}</span>`;
    const eventos = [];
    d.excedidos.forEach(c => eventos.push(`<span class="rojo">¡${esc(c)} quedó K.O.!</span> Superó su presupuesto.`));
    d.recurrentes.forEach(x => eventos.push(`Posible suscripción: <span class="oro">${esc(x.lugar)}</span> aprox. ${euros(x.montoAprox)}/mes`));
    d.posiblesDuplicados.forEach(x => eventos.push(`¿Cobro duplicado? ${esc(x.lugar)} ${euros(x.monto)} el ${esc(x.dia.slice(8))}/${esc(x.dia.slice(5, 7))}`));
    return cabecera('Reporte') + `
      <section class="win" style="text-align:center">
        <div class="banner">${r.cerrado ? '¡VICTORIA!' : 'BATALLA EN CURSO'}</div>
        <div class="px dim">Resumen de ${esc(nombreMes(mes))}</div>
        <div class="${r.cerrado ? 'cofre-anim' : ''}" style="margin:10px auto 4px;width:96px">${sp('cofre', 'xl')}</div>
        <div class="stat"><span class="k">Giles gastados</span><span class="num oro">${euros(d.total)}</span></div>
        <div class="stat"><span class="k">Variación</span><span class="num">${varTxt}</span></div>
        <div class="stat"><span class="k">Media diaria</span><span class="num">${euros(d.promedioDiario)}</span></div>
        <div class="stat"><span class="k">Objetos</span><span class="num">${d.cantidad}</span></div>
        ${d.mayorGasto ? `<div class="stat"><span class="k">Golpe crítico</span><span class="num" style="white-space:normal;overflow-wrap:anywhere">${esc(d.mayorGasto.lugar)} ${euros(d.mayorGasto.monto)}</span></div>` : ''}
      </section>
      <section class="win barras">
        <h2 class="titulo">Por categoría</h2>
        ${d.categorias.map(c => `<div class="b">${sp(c.categoria)}
          <div><div class="stat" style="font-size:19px"><span>${esc(c.categoria)}</span><span class="num">${euros(c.total)}</span></div>
          <div class="pista"><i style="width:${c.total / max * 100}%"></i></div></div>
          <span class="dim num" style="font-size:18px;min-width:44px;text-align:right">${c.porcentaje}%</span></div>`).join('')}
      </section>
      <section class="win">
        <h2 class="titulo">Top lugares</h2>
        ${d.topLugares.length ? `<ul class="menu">${d.topLugares.map((l, i) => `<li class="fila" style="padding:4px 0">
          <span class="px dim" style="width:20px">${i + 1}</span>${sp(l.categoria)}
          <span class="grow" style="min-width:0;overflow-wrap:anywhere">${esc(l.lugar)} <span class="dim">×${l.cantidad}</span></span><span class="num oro">${euros(l.total)}</span></li>`).join('')}</ul>`
        : '<div class="vacio">Sin datos.</div>'}
      </section>
      <section class="win">
        <h2 class="titulo">Eventos</h2>
        ${eventos.length ? eventos.map(e => `<div class="evento">${e}</div>`).join('') : '<div class="dim">Ningún evento especial. ¡Buen trabajo!</div>'}
      </section>`;
  }

  // ----- Añadir manual
  function vAnadir() {
    return cabecera('Añadir objeto') + `<form class="win" id="f-anadir">
      <label class="campo"><span>Lugar</span><input name="lugar" required maxlength="60" placeholder="Ej. Conad"></label>
      <label class="campo"><span>Monto (€)</span><input name="monto" required inputmode="decimal" placeholder="12,50"></label>
      <label class="campo"><span>Fecha</span><input name="fecha" type="datetime-local" value="${aLocalInput(new Date().toISOString())}"></label>
      <label class="campo"><span>Categoría</span><select name="categoria"><option value="">Automática</option>${CATS.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>
      <div class="botones"><button class="btn oro" type="submit">Guardar</button></div>
    </form>`;
  }

  // ----- Config
  function vConfig() {
    const c = config(), pres = (st.datos && st.datos.presupuestos) || {};
    return cabecera('Config') + `
      <form class="win" id="f-conexion">
        <h2 class="titulo">Conexión</h2>
        <label class="campo"><span>URL del Apps Script</span><input name="url" type="url" value="${esc(c.url)}" placeholder="https://script.google.com/macros/s/.../exec"></label>
        <label class="campo"><span>Token secreto</span><input name="token" type="password" value="${esc(c.token)}" autocomplete="off"></label>
        <div class="botones"><button class="btn oro" type="submit">Guardar y probar</button></div>
        ${c.url ? `<div class="botones"><button class="btn peligro" type="button" data-accion="desconectar">Volver a modo demo</button></div>` : ''}
      </form>
      <form class="win" id="f-presup">
        <h2 class="titulo">Presupuestos mensuales (HP)</h2>
        ${CATS.map(cat => `<label class="campo fila"><span class="grow" style="margin:0">${sp(cat)} ${esc(cat)}</span>
          <input name="${esc(cat)}" inputmode="decimal" style="width:110px" value="${pres[cat] ? String(pres[cat]).replace('.', ',') : ''}" placeholder="—"></label>`).join('')}
        <div class="botones"><button class="btn oro" type="submit">Guardar HP</button></div>
      </form>
      <form class="win" id="f-probar">
        <h2 class="titulo">Probar notificación</h2>
        <p class="dim" style="font-size:18px;margin:0 0 8px">Pega el texto de una notificación del banco para ver cómo se interpretaría (no se guarda).</p>
        <label class="campo"><span>Título</span><input name="titulo" placeholder="Intesa Sanpaolo"></label>
        <label class="campo"><span>Texto</span><textarea name="texto" placeholder="Pagamento di 12,50 EUR presso CONAD..."></textarea></label>
        <div class="botones"><button class="btn" type="submit">Analizar</button></div>
        <div id="res-probar"></div>
      </form>
      <section class="win">
        <h2 class="titulo">Opciones</h2>
        <label class="check"><input type="checkbox" id="opt-sonido" ${ls.get('gv_sonido', true) ? 'checked' : ''}> Sonidos 8-bit</label>
        ${enDemo() ? `<div class="botones"><button class="btn" type="button" data-accion="reiniciar-demo">Reiniciar datos demo</button></div>` : ''}
      </section>`;
  }

  // ---------------------------------------------------------------- modal de detalle
  function abrirDetalle(id) {
    const m = st.datos.movimientos.find(x => x.id === id);
    if (!m) return;
    let cat = m.categoria;
    const pintar = () => {
      $modal.innerHTML = `<form class="win" id="f-detalle">
        <div class="fila" style="margin-bottom:10px">${sp(cat, 'g')}<div class="grow"><h2 class="titulo" style="margin:0 0 4px">Objeto</h2><div class="trunc">${esc(m.lugar)}</div><div class="num oro">${euros(m.monto)}</div></div></div>
        <label class="campo"><span>Lugar</span><input name="lugar" value="${esc(m.lugar)}" maxlength="60"></label>
        <div class="fila" style="gap:8px">
          <label class="campo grow"><span>Monto (€)</span><input name="monto" inputmode="decimal" value="${String(m.monto).replace('.', ',')}"></label>
          <label class="campo grow"><span>Fecha</span><input name="fecha" type="datetime-local" value="${aLocalInput(m.fecha)}"></label>
        </div>
        <label class="campo"><span>Categoría</span></label>
        <ul class="menu cats">${CATS.map(c => `<li><button type="button" class="item ${c === cat ? 'sel' : ''}" data-elegir="${esc(c)}">${sp(c)}<span class="trunc">${esc(c)}</span></button></li>`).join('')}</ul>
        <label class="check"><input type="checkbox" name="recordar" checked> Recordar categoría para este lugar</label>
        <div class="botones">
          <button class="btn oro" type="submit">Guardar</button>
          <button class="btn" type="button" data-accion="cerrar">Volver</button>
        </div>
        <div class="botones"><button class="btn peligro" type="button" data-accion="tirar">Tirar objeto</button></div>
      </form>`;
    };
    pintar();
    $modal.hidden = false;
    $modal.onclick = async e => {
      const el = e.target.closest('[data-elegir],[data-accion]');
      if (e.target === $modal) return cerrarModal();
      if (!el) return;
      if (el.dataset.elegir) {
        // Conserva lo que se haya escrito antes de repintar.
        const f = $modal.querySelector('form');
        m.lugar = f.lugar.value; m.monto = numero(f.monto.value) || m.monto;
        cat = el.dataset.elegir; sfx.cursor(); pintar();
      } else if (el.dataset.accion === 'cerrar') {
        cerrarModal();
      } else if (el.dataset.accion === 'tirar') {
        if (!confirm('¿Tirar este objeto? Se borrará el gasto.')) return;
        await ejecutar(() => api('borrar', { id: m.id }), 'Objeto tirado.');
        cerrarModal(); cargarDatos(true);
      }
    };
    $modal.onsubmit = async e => {
      e.preventDefault();
      const f = e.target;
      const monto = numero(f.monto.value);
      if (!(monto > 0)) return toast('Monto inválido', true);
      const r = await ejecutar(() => api('editar', {
        id: m.id, lugar: f.lugar.value.trim(), monto, categoria: cat,
        fecha: f.fecha.value ? new Date(f.fecha.value).toISOString() : undefined,
        recordar: f.recordar.checked
      }), 'Guardado.');
      if (r && r.reclasificados) toast(`Guardado. ${r.reclasificados} objeto(s) más reclasificados.`);
      cerrarModal(); cargarDatos(true);
    };
  }

  function cerrarModal() { $modal.hidden = true; $modal.innerHTML = ''; $modal.onclick = $modal.onsubmit = null; }

  function avisarReporteNuevo() {
    const nuevo = (st.datos && st.datos.reportes || []).find(r => !r.visto);
    if (!nuevo || st.avisado[nuevo.mes] || ruta().vista === 'reporte') return;
    st.avisado[nuevo.mes] = true;
    sfx.tesoro();
    $modal.innerHTML = `<div class="win" style="text-align:center">
      <div class="cofre-anim" style="width:96px;margin:6px auto">${sp('cofre', 'xl')}</div>
      <p class="px" style="line-height:1.8">¡Obtuviste<br><span class="oro">Reporte de ${esc(nombreMes(nuevo.mes))}</span>!</p>
      <div class="botones"><button class="btn oro" data-accion="ver">Ver</button><button class="btn" data-accion="luego">Luego</button></div>
    </div>`;
    $modal.hidden = false;
    $modal.onclick = e => {
      const a = e.target.closest('[data-accion]');
      if (!a && e.target !== $modal) return;
      cerrarModal();
      if (a && a.dataset.accion === 'ver') ir('reporte/' + nuevo.mes);
    };
  }

  // ---------------------------------------------------------------- acciones
  function numero(s) { s = String(s).trim().replace(/\s|€/g, ''); return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s); }

  async function ejecutar(fn, msgOk) {
    try { const r = await fn(); sfx.ok(); if (msgOk) toast(msgOk); return r; }
    catch (e) { sfx.error(); toast(e.message, true); return null; }
  }

  let toastT;
  function toast(msg, error) {
    $toast.innerHTML = `<span class="${error ? 'rojo' : ''}">${esc(msg)}</span>`;
    $toast.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { $toast.hidden = true; }, 2800);
  }

  $app.addEventListener('click', async e => {
    const el = e.target.closest('button, [data-ir]');
    if (!el) return;
    if (el.dataset.menu !== undefined) { st.menuSel = Number(el.dataset.menu); ls.set('gv_menu', st.menuSel); }
    if (el.dataset.ir) { sfx.cursor(); if (el.dataset.ir === 'inicio' && !location.hash) render(); else ir(el.dataset.ir); return; }
    if (el.dataset.mes) {
      sfx.cursor();
      st.mes = desplazarMes(st.mes, Number(el.dataset.mes));
      if (st.mes > mesHoy()) st.mes = mesHoy();
      st.datos = ls.get(claveCache(st.mes), st.datos);
      render(); cargarDatos(true); return;
    }
    if (el.dataset.mov) { sfx.cursor(); abrirDetalle(el.dataset.mov); return; }
    if (el.dataset.filtro !== undefined) { sfx.cursor(); st.filtro = el.dataset.filtro || null; render(); return; }
    if (el.dataset.cat) { sfx.cursor(); st.filtro = el.dataset.cat; ir('objetos'); return; }
    if (el.dataset.accion === 'desconectar') {
      ls.set('gv_url', ''); toast('Modo demo activado.'); st.datos = null; cargarDatos(); return;
    }
    if (el.dataset.accion === 'reintentar') { st.error = null; render(); cargarDatos(); return; }
    if (el.dataset.accion === 'reiniciar-demo') { Demo.reiniciar(); st.datos = null; cargarDatos(); toast('Datos demo reiniciados.'); }
  });

  $app.addEventListener('change', e => {
    if (e.target.id === 'opt-sonido') { ls.set('gv_sonido', e.target.checked); sfx.ok(); }
  });

  $app.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'f-anadir') {
      const monto = numero(f.monto.value);
      if (!(monto > 0)) return toast('Monto inválido', true);
      const r = await ejecutar(() => api('agregar', {
        lugar: f.lugar.value.trim(), monto, categoria: f.categoria.value,
        fecha: f.fecha.value ? new Date(f.fecha.value).toISOString() : undefined
      }));
      if (r) { sfx.tesoro(); toast(`¡Obtuviste ${r.movimiento.lugar}! (${r.movimiento.categoria})`); f.reset(); st.mes = claveMes(new Date(r.movimiento.fecha)); cargarDatos(true); }
    } else if (f.id === 'f-conexion') {
      const url = f.url.value.trim(), token = f.token.value.trim();
      if (url && !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)) return toast('La URL debe terminar en /exec', true);
      ls.set('gv_url', url); ls.set('gv_token', token); ls.set('gv_via', 'post');
      if (!url) { st.datos = null; return cargarDatos(); }
      const r = await ejecutar(() => api('ping'), '¡Conectado al cofre!');
      if (r) { st.datos = null; cargarDatos(); }
    } else if (f.id === 'f-presup') {
      const p = {}; CATS.forEach(c => { const v = numero(f.elements[c].value); if (v > 0) p[c] = v; });
      const r = await ejecutar(() => api('presupuestos', { presupuestos: p }), 'HP guardados.');
      if (r) cargarDatos(true);
    } else if (f.id === 'f-probar') {
      const out = f.querySelector('#res-probar');
      out.innerHTML = '<span class="cargando dim">Analizando</span>';
      try {
        const j = await api('probar', { titulo: f.titulo.value, texto: f.texto.value });
        if (!j.ok) throw new Error(j.error);
        const r = j.resultado;
        out.innerHTML = r.esPago
          ? `<div class="evento verde">✔ Se registraría así:</div><div class="fila">${sp(r.categoria)}<span class="grow">${esc(r.lugar)}<span class="sub">${esc(r.categoria)} · ${fechaCorta(r.fecha)}</span></span><span class="num oro">${euros(r.monto)}</span></div>`
          : `<div class="evento rojo">✘ Se ignoraría: ${esc(r.motivo)}</div>`;
      } catch (err) { out.innerHTML = `<div class="evento rojo">${esc(err.message)}</div>`; }
    }
  });

  // Volver a cargar al regresar a la app (p. ej. tras un pago).
  document.addEventListener('visibilitychange', () => { if (!document.hidden && st.datos) cargarDatos(true); });

  // ---------------------------------------------------------------- arranque
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  // Enlace mágico del correo "conecta tu teléfono": #conectar?u=URL&t=TOKEN
  if (/^#conectar\?/.test(location.hash)) {
    const q = new URLSearchParams(location.hash.slice('#conectar?'.length));
    if (q.get('u') && q.get('t')) {
      ls.set('gv_url', q.get('u')); ls.set('gv_token', q.get('t'));
      history.replaceState(null, '', location.pathname);
      setTimeout(() => toast('¡Cofre conectado!'), 600);
    }
  }
  st.datos = ls.get(claveCache(st.mes), null);
  render();
  cargarDatos();
})();
