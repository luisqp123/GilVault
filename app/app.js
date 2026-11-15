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
  // anim: 'siempre' (se mueve todo el tiempo) o 'sel' (solo cuando su fila está seleccionada).
  const sp = (nombre, clase, anim) => `<span class="sprite ${clase || ''}"${anim && Sprites.ANIM[nombre] ? ` data-anim="${esc(nombre)}" data-modo="${anim}"` : ''}>${Sprites.svg(nombre)}</span>`;
  const menosMovimiento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const aLocalInput = iso => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  // Cursor de manita como variable CSS.
  // ---------------------------------------------------------------- color de ventanas (4 esquinas)
  const ESQ = ['tl', 'tr', 'bl', 'br'];
  const PALETAS = {
    'Clásico': ['#2c44c8', '#2c44c8', '#0b1450', '#0b1450'],
    'Cristal': ['#4a6ae8', '#1c2c94', '#1c2c94', '#060b34'],
    'Medianoche': ['#3a3a58', '#18182e', '#18182e', '#05050f'],
    'Esmeralda': ['#23a06a', '#0f5a3a', '#0f5a3a', '#04241a'],
    'Carmesí': ['#c03244', '#6a1020', '#6a1020', '#2a0510'],
    'Ámbar': ['#c8901e', '#7a5010', '#7a5010', '#2a1a05'],
    'Violeta': ['#8a48d2', '#3a1a7a', '#3a1a7a', '#140830'],
    'Cuatro reinos': ['#b83030', '#2c44c8', '#2f8a3c', '#a88a10']
  };
  function aplicarColores(c) {
    const r = document.documentElement.style;
    ESQ.forEach((k, i) => r.setProperty('--c-' + k, c[i]));
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = c[2];
  }
  const coloresGuardados = () => ls.get('gv_colores', PALETAS['Clásico']);
  aplicarColores(coloresGuardados());

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
    tesoro: () => tono([659, 784, 1046, 1318, 1175, 1318, 1568], 0.08),
    voz: () => tono([660 + Math.round(Math.random() * 180)], 0.025, 'triangle')
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
      detectarNuevos(d);
    } catch (e) {
      const c = ls.get(claveCache(st.mes), null);
      st.datos = c; st.offline = true; st.error = e.message;
      if (c) toast('Sin conexión: ' + e.message, true);
    }
    render();
    if (!avisarObjetosNuevos()) avisarReporteNuevo();
  }

  // Objetos que llegaron desde la última vez que abriste la app.
  let nuevosPendientes = [];
  function detectarNuevos(d) {
    if (enDemo() || d.mes !== mesHoy()) return;
    const clave = 'gv_vistos';
    const vistos = ls.get(clave, null);
    const ids = d.movimientos.map(m => m.id);
    if (vistos) {
      const set = new Set(vistos);
      nuevosPendientes = nuevosPendientes.concat(d.movimientos.filter(m => !set.has(m.id) && !nuevosPendientes.some(x => x.id === m.id)));
    }
    ls.set(clave, [...new Set((vistos || []).concat(ids))].slice(-600));
  }

  function avisarObjetosNuevos() {
    if (!nuevosPendientes.length || !$modal.hidden) return false;
    const lista = nuevosPendientes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    nuevosPendientes = [];
    sfx.tesoro();
    const uno = lista.length === 1;
    $modal.innerHTML = `<div class="win" style="text-align:center">
      <div class="cofre-anim" style="width:96px;margin:6px auto">${sp('cofre', 'xl', 'siempre')}</div>
      <p class="px oro" style="line-height:1.8">✦ ¡${uno ? 'Obtuviste un objeto' : `Obtuviste ${lista.length} objetos`}! ✦</p>
      <ul class="menu" style="text-align:left">${lista.slice(0, 5).map(m => `<li class="fila" style="padding:4px 0">${sp(m.categoria, '', 'siempre')}
        <span class="grow" style="min-width:0;overflow-wrap:anywhere">${esc(m.lugar)}</span><span class="num oro">${euros(m.monto)}</span></li>`).join('')}</ul>
      ${lista.length > 5 ? `<p class="dim">…y ${lista.length - 5} más</p>` : ''}
      <div class="botones"><button class="btn oro" data-accion="ok">¡Bien!</button></div>
    </div>`;
    $modal.hidden = false;
    $modal.onclick = e => {
      if (e.target === $modal || e.target.closest('[data-accion]')) { cerrarModal(); avisarReporteNuevo(); }
    };
    return true;
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
      $app.innerHTML = avisos() + vConfig() + `<div class="pie">GILVAULT v10</div>`;
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
    $app.innerHTML = avisos() + (vistas[vista] || vInicio)() + `<div class="pie">GILVAULT v10</div>`;
    montarSabio();
    montarGato();
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

  // MP = maná: presupuesto total del mes que te queda.
  function barraMP(gastado, limite) {
    const resto = limite - gastado;
    const pct = limite ? Math.max(0, Math.min(100, resto / limite * 100)) : 0;
    return `<div class="hp mp"><div class="lbl"><span class="dim fila" style="gap:4px">${sp('gil', 'mini', 'siempre')}MP</span><span class="num">${resto < 0 ? '<span class="rojo">¡Sin maná!</span> ' : ''}${euros(Math.max(0, resto))} / ${euros(limite)}</span></div>
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
          ${sp('cofre', 'g', 'siempre')}
          <div>
            <div class="stat"><span class="k">Gastado</span><span class="num oro">${euros(r.total)}</span></div>
            <div class="stat"><span class="k">Objetos</span><span class="num">${r.cantidad}</span></div>
            <div class="stat"><span class="k">Media/día</span><span class="num">${euros(r.promedioDiario)}</span></div>
          </div>
        </div>
        ${limites ? barraMP(r.total, limites) : ''}
      </section>
      <nav class="win menu-gato ${st.gato && !st.gato.cerrado ? 'con-dialogo' : ''}" aria-label="Menú" style="--ladrillo:${fondoSprite('ladrillo')}">
        <ul class="menu estantes">
          ${opciones.map(([id, txt, extra], i) => `<li style="--pocion:${fondoSprite('pocion_' + (i + 1))}"><button class="item px ${i === st.menuSel ? 'sel' : ''}" data-menu="${i}" data-ir="${id}">${txt}${extra}</button></li>`).join('')}
        </ul>
        <button class="gato-btn" id="gato" type="button" aria-label="Maese Ronroneo, el gato del mercado: toca para que te lea una carta">
          <span class="tienda" aria-hidden="true">
            <span class="letrero px">✦ Tócame ✦</span>
            <span class="tienda-caja">
              <span class="cielo" id="cielo"></span>
              <span class="astro" id="astro"></span>
              <span class="estrellas-cielo" id="estrellas">${'<i></i>'.repeat(7)}</span>
              <span class="escena">${Sprites.svg('tienda')}</span>
              <span class="sprite gato-sprite" id="gato-sprite" data-anim="gato_1" data-modo="siempre">${Sprites.svg('gato_1')}</span>
            </span>
          </span>
        </button>
      </nav>
      ${st.gato && !st.gato.cerrado ? `<section class="win gato-dialogo" id="gato-dialogo" aria-live="polite">
        <div class="fila"><span class="px oro grow" style="font-size:9px">Maese Ronroneo · dueño del mercado</span>
          <button class="btn mini" data-accion="cerrar-gato" aria-label="Cerrar">✕</button></div>
        <p id="gato-texto" style="margin:6px 0 0;min-height:3.6em"></p><span class="sigue" id="gato-sigue">▼</span>
      </section>` : ''}
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
          ${CATS.map(c => `<button class="chip ${st.filtro === c ? 'on' : ''}" data-filtro="${esc(c)}">${sp(c, '', 'sel')}${esc(c.split('/')[0])}</button>`).join('')}
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
        ${sp(c.categoria, '', 'sel')}
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
    st.sabio = { mensajes: mensajesSabio(mes, d, r.cerrado), i: 0 };
    return cabecera('Reporte') + `
      <section class="win sabio" id="sabio" aria-label="El Sabio Ábaco">
        <div class="sabio-fig">
          <span class="sprite sabio-sprite" id="sabio-sprite"></span>
          <div class="particulas" aria-hidden="true">${'<i></i>'.repeat(9)}</div>
        </div>
        <button class="dialogo" id="sabio-dialogo" type="button" aria-live="polite">
          <span class="px oro nombre">Sabio Ábaco</span>
          <span id="sabio-texto"></span><span class="sigue" id="sabio-sigue">▼</span>
        </button>
      </section>
      <section class="win" style="text-align:center">
        <div class="banner">${r.cerrado ? '¡VICTORIA!' : 'BATALLA EN CURSO'}</div>
        <div class="px dim">Resumen de ${esc(nombreMes(mes))}</div>
        <div class="${r.cerrado ? 'cofre-anim' : ''}" style="margin:10px auto 4px;width:96px">${sp('cofre', 'xl', 'siempre')}</div>
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
        <h2 class="titulo">Color de ventanas</h2>
        <p class="dim" style="font-size:18px;margin:0 0 10px">Elige un color para cada esquina; las ventanas mezclan los cuatro.</p>
        <div class="esquinas">
          ${ESQ.map((k, i) => `<label class="${k}"><input type="color" data-esquina="${i}" value="${coloresGuardados()[i]}" aria-label="Esquina ${['superior izquierda', 'superior derecha', 'inferior izquierda', 'inferior derecha'][i]}">${['↖', '↗', '↙', '↘'][i]}</label>`).join('')}
          <div class="win muestra"><span class="px">Vista<br>previa</span></div>
        </div>
        <div class="paletas">${Object.entries(PALETAS).map(([n, c]) => `<button type="button" class="paleta" title="${esc(n)}" aria-label="Paleta ${esc(n)}" data-paleta="${esc(n)}"
          style="background:linear-gradient(to right, ${c[2]}, ${c[3]})"><span style="display:block;width:100%;height:100%;border-radius:3px;background:linear-gradient(to right, ${c[0]}, ${c[1]});-webkit-mask-image:linear-gradient(#000,transparent);mask-image:linear-gradient(#000,transparent)"></span></button>`).join('')}</div>
      </section>
      <section class="win">
        <h2 class="titulo">Opciones</h2>
        <label class="check"><input type="checkbox" id="opt-sonido" ${ls.get('gv_sonido', true) ? 'checked' : ''}> Sonidos 8-bit</label>
        <p class="dim" style="font-size:18px;margin:10px 0 6px">Sonido de "objeto obtenido" para la notificación de MacroDroid:</p>
        <div class="botones" style="margin-top:0"><a class="btn" href="sonidos/objeto.ogg" download="gilvault-objeto.ogg">Descargar sonido</a>
          <button class="btn" type="button" data-accion="oir-sonido">▶ Escuchar</button></div>
        ${enDemo() ? `<div class="botones"><button class="btn" type="button" data-accion="reiniciar-demo">Reiniciar datos demo</button></div>` : ''}
      </section>`;
  }

  // ---------------------------------------------------------------- animaciones 8-bit
  const cacheSvg = {};
  const svgDe = n => cacheSvg[n] || (cacheSvg[n] = Sprites.svg(n));
  setInterval(() => {
    if (document.hidden || menosMovimiento()) return;
    const ahora = Date.now();
    document.querySelectorAll('[data-anim]').forEach(el => {
      const a = Sprites.ANIM[el.dataset.anim];
      if (!a) return;
      let n = a.f[0];
      if (el.dataset.modo === 'siempre' || el.closest('.sel, .on, :hover')) n = a.f[Math.floor(ahora / a.ms) % a.f.length];
      if (el.dataset.f !== n) { el.dataset.f = n; el.innerHTML = svgDe(n); }
    });
  }, 80);

  // ---------------------------------------------------------------- el Sabio Ábaco
  function mensajesSabio(mes, d, cerrado) {
    const m = [];
    const cats = d.categorias.filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    const nombre = nombreMes(mes);
    if (!d.cantidad) {
      return [cerrado ? `En ${nombre} tu cofre no registró gastos. Un mes tranquilo… o un misterio.`
        : 'Aún no veo gastos este mes, joven aventurero. Cuando pagues con tu tarjeta, aquí aparecerá tu botín.'];
    }
    m.push(cerrado ? `¡Ah, aventurero! He estudiado el pergamino de ${nombre}. Escucha bien…`
      : '¡Ah, aventurero! He repasado mi pergamino de cuentas de este mes…');
    const top = cats[0];
    if (top) {
      const lug = d.topLugares.find(l => l.categoria === top.categoria);
      m.push(`Tu oro fluye sobre todo hacia ${top.categoria}: ${euros(top.total)}, el ${top.porcentaje}% de lo gastado` +
        (lug ? `. Allí ${lug.lugar} se lleva ${euros(lug.total)}.` : '.'));
    }
    if (d.topLugares[0] && (!top || d.topLugares[0].categoria !== top.categoria)) {
      const l = d.topLugares[0];
      m.push(`El lugar que más giles te cobra es ${l.lugar}: ${euros(l.total)} en ${l.cantidad} visita${l.cantidad === 1 ? '' : 's'}.`);
    }
    const mana = d.categorias.reduce((s, c) => s + (c.presupuesto || 0), 0);
    if (mana > 0) {
      const resto = mana - d.total;
      if (!cerrado) {
        const [a, mm] = mes.split('-').map(Number);
        const dias = Math.max(1, new Date(a, mm, 0).getDate() - new Date().getDate() + 1);
        m.push(resto >= 0
          ? `Te quedan ${euros(resto)} de maná para ${dias} día${dias === 1 ? '' : 's'}: unos ${euros(resto / dias)} por día. Úsalo con sabiduría.`
          : `¡Tu maná se agotó! Te pasaste ${euros(-resto)} del presupuesto del mes. Toca descansar el hechizo de la tarjeta.`);
      } else {
        m.push(resto >= 0 ? `Terminaste el mes con ${euros(resto)} de maná sin usar. ¡Digno de un archimago!`
          : `Este mes gastaste ${euros(-resto)} más del maná que tenías. El próximo, más prudencia.`);
      }
    } else {
      m.push('Aún no has sellado tu reserva de maná. Ve a CONFIG y fija tus presupuestos: así podré decirte cuánto te queda.');
    }
    if (d.excedidos.length) m.push(`Cuidado: ${d.excedidos.join(', ')} ${d.excedidos.length === 1 ? 'quedó' : 'quedaron'} K.O., sin HP.`);
    if (d.variacion !== null) {
      m.push(d.variacion > 0 ? `Gastas un ${Math.abs(d.variacion)}% más que el mes anterior. Vigila tu bolsa.`
        : `Gastas un ${Math.abs(d.variacion)}% menos que el mes anterior. ¡Tu disciplina crece!`);
    }
    if (d.recurrentes.length) m.push(`Siento cobros que vuelven cada mes: ${d.recurrentes.map(x => x.lugar).slice(0, 3).join(', ')}. ¿Aún los usas todos?`);
    m.push('Toca para escucharme de nuevo. Que tus giles se multipliquen.');
    return m;
  }

  // ---------------------------------------------------------------- Maese Ronroneo, el gato del mercado
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  // Cambio euro/dólar del Banco Central Europeo (servicio público Frankfurter), guardado un día.
  async function mercado() {
    const c = ls.get('gv_mercado', null);
    if (c && c.dia === hoyISO()) return c;
    const desde = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    for (const base of ['https://api.frankfurter.dev/v1/', 'https://api.frankfurter.app/']) {
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 5000);
        const r = await fetch(`${base}${desde}..?from=EUR&to=USD`, { signal: ctrl.signal });
        clearTimeout(t);
        if (!r.ok) continue;
        const j = await r.json();
        const fechas = Object.keys(j.rates || {}).sort();
        if (fechas.length < 2) continue;
        const hoy = j.rates[fechas[fechas.length - 1]].USD, ayer = j.rates[fechas[fechas.length - 2]].USD;
        const m = { dia: hoyISO(), usd: hoy, cambio: (hoy - ayer) / ayer * 100 };
        ls.set('gv_mercado', m);
        return m;
      } catch (e) { }
    }
    return null;
  }

  function semanaVsAnterior() {
    const movs = (st.datos && st.datos.movimientos) || [];
    const ahora = Date.now(), dia = 86400000;
    let esta = 0, antes = 0;
    movs.forEach(m => {
      const t = ahora - new Date(m.fecha).getTime();
      if (t < 7 * dia) esta += m.monto; else if (t < 14 * dia) antes += m.monto;
    });
    return antes > 0 ? { esta, antes, cambio: (esta - antes) / antes * 100 } : null;
  }

  async function saludoGato() {
    const h = new Date().getHours();
    const partes = [];
    partes.push(h < 6 ? '¿Despierto a estas horas, viajero? Los mercados nunca duermen… y yo tampoco.'
      : h < 13 ? '¡Buenos días, viajero! Bienvenido a mi mercado.'
        : h < 20 ? '¡Buenas tardes, viajero! Pasa, que las cartas ya están sobre la mesa.'
          : '¡Buenas noches, viajero! La vela aún arde para ti.');
    const m = await mercado();
    if (m) {
      const sube = m.cambio >= 0;
      partes.push(`Las cartas del mercado dicen: 1 € vale ${m.usd.toFixed(4).replace('.', ',')} $, ${sube ? '▲' : '▼'} ${Math.abs(m.cambio).toFixed(2).replace('.', ',')}% desde la última sesión. ${sube ? 'El euro se fortalece: buen momento si compras en dólares.' : 'El euro se debilita un poco: paciencia con las compras en dólares.'}`);
    }
    const s = semanaVsAnterior();
    if (s) {
      partes.push(s.cambio > 10 ? `Esta semana gastaste ${euros(s.esta)}, un ${Math.round(s.cambio)}% más que la anterior. Tus fluctuaciones suben…`
        : s.cambio < -10 ? `Esta semana gastaste ${euros(s.esta)}, un ${Math.round(-s.cambio)}% menos que la anterior. ¡Así se hace!`
          : `Esta semana gastaste ${euros(s.esta)}, casi lo mismo que la anterior. Mercado estable.`);
    }
    const top = st.datos && st.datos.resumen && st.datos.resumen.mayorCategoria;
    const pct = top ? (st.datos.resumen.categorias.find(c => c.categoria === top) || {}).porcentaje : 0;
    partes.push('Consejo del día: ' + (top && pct >= 35 && Math.random() < 0.6 ? Gato.CONSEJOS_CATEGORIA[top] : azar(Gato.CONSEJOS)));
    partes.push('Tócame si quieres que te lea una carta.');
    return partes;
  }

  // Escribe un texto letra a letra; devuelve un control para completarlo de golpe.
  function escribir($el, texto, alTerminar, voz) {
    let i = 0;
    if (menosMovimiento()) { $el.textContent = texto; alTerminar && alTerminar(); return { completar() { } }; }
    const t = setInterval(() => {
      if (!document.body.contains($el)) { clearInterval(t); return; }
      i++; $el.textContent = texto.slice(0, i);
      if (voz && i % 2 === 0 && texto[i - 1] !== ' ') voz();
      if (i >= texto.length) { clearInterval(t); alTerminar && alTerminar(); }
    }, 32);
    return { completar() { if (i < texto.length) { i = texto.length - 1; } } };
  }

  const vozGato = () => tono([360 + Math.round(Math.random() * 120)], 0.03, 'triangle');

  // Sprite como imagen de fondo CSS (para el ladrillo y las pociones de los estantes).
  const cacheFondo = {};
  const fondoSprite = n => cacheFondo[n] || (cacheFondo[n] = `url('data:image/svg+xml,${encodeURIComponent(Sprites.svg(n))}')`);  // comillas simples: va dentro de style="..." 

  // Cielo de la ventana según la hora: amanecer, día, atardecer o noche.
  function pintarCielo() {
    const $c = document.getElementById('cielo'), $a = document.getElementById('astro'), $e = document.getElementById('estrellas');
    if (!$c) return;
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    let fondo, astro = 'sol', x, y, estrellas = false;
    if (h >= 6 && h < 8) { fondo = 'linear-gradient(#6a8fd8, #ffc27a)'; x = 33; y = 40 - (h - 6) * 8; }
    else if (h >= 8 && h < 17) {
      const t = (h - 8) / 9;                       // 0 → 1 a lo largo del día
      fondo = 'linear-gradient(#5ab8f5, #d6f3ff)'; x = 32 + t * 28; y = 26 - Math.sin(t * Math.PI) * 18;
    } else if (h >= 17 && h < 20) { fondo = 'linear-gradient(#6a3cc2, #ff8a5a)'; x = 58; y = 24 + (h - 17) * 6; }
    else { fondo = 'linear-gradient(#060a24, #1c2a6a)'; astro = 'luna'; x = 38; y = 10; estrellas = true; }
    $c.style.background = fondo;
    $a.style.left = x + '%'; $a.style.top = y + '%';
    if ($a.dataset.f !== astro) { $a.dataset.f = astro; $a.innerHTML = Sprites.svg(astro); }
    $e.style.display = estrellas ? '' : 'none';
  }
  setInterval(pintarCielo, 60000);

  function montarGato() {
    const $gato = document.getElementById('gato');
    if (!$gato) return;
    pintarCielo();
    $gato.onclick = () => { sfx.cursor(); leerCarta(); };
    // Saludo: una vez por sesión, al entrar en el inicio.
    if (!st.gato) {
      st.gato = { partes: null, i: 0, cerrado: false };
      saludoGato().then(p => { st.gato.partes = p; if (ruta().vista === 'inicio') render(); });
      return;
    }
    const $txt = document.getElementById('gato-texto');
    if (!$txt || !st.gato.partes) return;
    const $spr = document.getElementById('gato-sprite'), $sigue = document.getElementById('gato-sigue');
    let ctl = null, hablando = false;
    const decir = () => {
      hablando = true; $sigue.style.visibility = 'hidden'; $spr.dataset.anim = 'gato_habla';
      ctl = escribir($txt, st.gato.partes[st.gato.i], () => {
        hablando = false; $sigue.style.visibility = 'visible'; $spr.dataset.anim = 'gato_1';
      }, vozGato);
    };
    document.getElementById('gato-dialogo').onclick = e => {
      if (e.target.closest('[data-accion="cerrar-gato"]')) { st.gato.cerrado = true; sfx.cursor(); render(); return; }
      if (hablando) { ctl.completar(); return; }
      if (st.gato.i < st.gato.partes.length - 1) { st.gato.i++; sfx.cursor(); decir(); }
      else { st.gato.cerrado = true; render(); }
    };
    decir();
  }

  function leerCarta() {
    const [num, nombre, lectura] = azar(Gato.CARTAS);
    // Datos sin repetir hasta agotar la baraja de curiosidades.
    let orden = ls.get('gv_datos_orden', []);
    if (!orden.length) orden = Gato.DATOS.map((_, i) => i).sort(() => Math.random() - 0.5);
    const dato = Gato.DATOS[orden.shift()] || azar(Gato.DATOS);
    ls.set('gv_datos_orden', orden);
    const $spr = document.getElementById('gato-sprite');
    if ($spr) { $spr.dataset.anim = ''; $spr.dataset.f = 'gato_carta'; $spr.innerHTML = Sprites.svg('gato_carta'); }
    $modal.innerHTML = `<div class="win" style="text-align:center">
      <p class="px oro" style="font-size:10px">Maese Ronroneo baraja las cartas…</p>
      <div class="carta" id="carta"><div class="cara dorso"></div>
        <div class="cara frente"><span class="px num-carta">${esc(num)}</span><span class="estrellas">✦ ✦ ✦</span><span class="px nombre-carta">${esc(nombre)}</span></div></div>
      <p id="carta-lectura" style="min-height:2.4em;margin:10px 0 4px"></p>
      <p class="dim" id="carta-dato" style="min-height:2.4em;margin:0;font-size:20px"></p>
      <div class="botones"><button class="btn oro" data-accion="cerrar-carta">Gracias, maese</button></div>
    </div>`;
    $modal.hidden = false;
    let ctl = null;
    setTimeout(() => {
      const $c = document.getElementById('carta'); if (!$c) return;
      $c.classList.add('volteada'); sfx.ok();
      setTimeout(() => {
        const $l = document.getElementById('carta-lectura'), $d = document.getElementById('carta-dato');
        if (!$l) return;
        ctl = escribir($l, `${nombre}: ${lectura}`, () => { ctl = escribir($d, 'Dato curioso: ' + dato, null, vozGato); }, vozGato);
      }, menosMovimiento() ? 0 : 700);
    }, menosMovimiento() ? 0 : 700);
    $modal.onclick = e => {
      if (e.target === $modal || e.target.closest('[data-accion="cerrar-carta"]')) {
        cerrarModal();
        const s2 = document.getElementById('gato-sprite');
        if (s2) { s2.dataset.anim = 'gato_1'; }
      } else if (ctl) ctl.completar();
    };
  }

  let sabioT = null;
  function montarSabio() {
    clearInterval(sabioT); sabioT = null;
    const el = document.getElementById('sabio-sprite');
    if (!el || !st.sabio) return;
    const $txt = document.getElementById('sabio-texto'), $sigue = document.getElementById('sabio-sigue');
    const quieto = menosMovimiento();
    let modo = 'aparece', letra = 0, tic = 0, parp = 0;
    el.innerHTML = quieto ? Sprites.svg('sabio_1') : Sprites.svgPixeles('sabio_1', 900);
    const decir = () => { letra = 0; modo = 'habla'; $sigue.style.visibility = 'hidden'; };
    const mostrar = n => { if (el.dataset.f !== n) { el.dataset.f = n; el.innerHTML = svgDe(n); } };
    setTimeout(() => { if (modo === 'aparece') decir(); }, quieto ? 0 : 1000);
    sabioT = setInterval(() => {
      if (!document.body.contains(el)) { clearInterval(sabioT); return; }
      tic++;
      const msg = st.sabio.mensajes[st.sabio.i] || '';
      if (modo === 'habla') {
        letra = Math.min(msg.length, letra + 1);
        $txt.textContent = msg.slice(0, letra);
        if (letra % 2 === 0 && msg[letra - 1] !== ' ') sfx.voz();
        if (!quieto) mostrar(tic % 4 < 2 ? 'sabio_habla_1' : 'sabio_habla_2');
        if (letra >= msg.length) { modo = 'espera'; $sigue.style.visibility = 'visible'; }
      } else if (modo === 'espera' && !quieto) {
        // Respiración lenta y parpadeo de vez en cuando.
        if (tic % 70 === 0) parp = 3;
        if (parp > 0) { parp--; mostrar('sabio_parpadeo'); }
        else mostrar(Math.floor(tic / 12) % 2 ? 'sabio_2' : 'sabio_1');
      }
    }, 40);
    document.getElementById('sabio-dialogo').onclick = () => {
      const msg = st.sabio.mensajes[st.sabio.i] || '';
      if (modo === 'habla') { letra = msg.length; return; }        // completar la frase
      if (modo !== 'espera') return;
      sfx.cursor();
      st.sabio.i = (st.sabio.i + 1) % st.sabio.mensajes.length;  // siguiente (y vuelve a empezar)
      decir();
    };
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
        <ul class="menu cats">${CATS.map(c => `<li><button type="button" class="item ${c === cat ? 'sel' : ''}" data-elegir="${esc(c)}">${sp(c, '', 'sel')}<span class="trunc">${esc(c)}</span></button></li>`).join('')}</ul>
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
    if (el.dataset.paleta) {
      const c = PALETAS[el.dataset.paleta]; sfx.ok(); aplicarColores(c); ls.set('gv_colores', c);
      document.querySelectorAll('[data-esquina]').forEach(i => { i.value = c[Number(i.dataset.esquina)]; });
      return;
    }
    if (el.dataset.accion === 'oir-sonido') { try { new Audio('sonidos/objeto.ogg').play(); } catch (err) { } return; }
    if (el.dataset.accion === 'reintentar') { st.error = null; render(); cargarDatos(); return; }
    if (el.dataset.accion === 'reiniciar-demo') { Demo.reiniciar(); st.datos = null; cargarDatos(); toast('Datos demo reiniciados.'); }
  });

  $app.addEventListener('input', e => {
    if (e.target.dataset.esquina === undefined) return;
    const c = coloresGuardados().slice();
    c[Number(e.target.dataset.esquina)] = e.target.value;
    aplicarColores(c); ls.set('gv_colores', c);
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
