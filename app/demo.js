// Modo DEMO: un backend falso en el navegador con datos de ejemplo.
// Se usa mientras no configures la URL de tu Apps Script en CONFIG.
(function (root) {
  const CATS = ['Comida', 'Salud', 'Transporte', 'Tiempo libre', 'Hogar/Servicios', 'Suscripciones', 'Otros'];
  const CLAVE = 'gv_demo_v1';

  const pad = n => String(n).padStart(2, '0');
  const claveMes = d => d.getFullYear() + '-' + pad(d.getMonth() + 1);
  const claveDia = d => claveMes(d) + '-' + pad(d.getDate());
  const r2 = n => Math.round(n * 100) / 100;
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const mesAnterior = mes => { const [a, m] = mes.split('-').map(Number); return claveMes(new Date(a, m - 2, 1)); };

  function generar() {
    let semilla = 7;
    const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    const elegir = a => a[Math.floor(rnd() * a.length)];
    const hoy = new Date();
    const movs = [];
    let id = 1;
    const add = (d, monto, lugar, categoria) =>
      movs.push({ id: 'd' + (id++), fecha: d.toISOString(), monto: r2(monto), lugar, categoria, origen: 'notificación' });

    for (let k = 3; k >= 0; k--) {
      const base = new Date(hoy.getFullYear(), hoy.getMonth() - k, 1);
      const diasMes = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      const hasta = k === 0 ? hoy.getDate() : diasMes;
      const dia = () => new Date(base.getFullYear(), base.getMonth(), 1 + Math.floor(rnd() * hasta), 8 + Math.floor(rnd() * 13), Math.floor(rnd() * 60));
      for (let i = 0; i < Math.round(hasta * 0.7); i++) add(dia(), 3 + rnd() * 38, elegir(['CONAD CITY', 'ESSELUNGA', 'BAR CENTRALE', 'PIZZERIA DA GINO', 'GLOVO', 'LIDL']), 'Comida');
      for (let i = 0; i < Math.round(hasta / 5); i++) add(dia(), 2.2 + rnd() * 30, elegir(['ATM MILANO', 'TRENITALIA', 'ENILIVE STATION']), 'Transporte');
      if (rnd() > 0.3) add(dia(), 6 + rnd() * 25, 'FARMACIA SAN MARCO', 'Salud');
      for (let i = 0; i < 3; i++) add(dia(), 8 + rnd() * 45, elegir(['UCI CINEMAS', 'STEAM', 'FELTRINELLI']), 'Tiempo libre');
      if (hasta >= 5) {
        add(new Date(base.getFullYear(), base.getMonth(), 5, 3), 13.99, 'NETFLIX.COM', 'Suscripciones');
        add(new Date(base.getFullYear(), base.getMonth(), 5, 4), 10.99, 'SPOTIFY', 'Suscripciones');
        add(new Date(base.getFullYear(), base.getMonth(), 4, 9), 9.99, 'ILIAD', 'Hogar/Servicios');
      }
      if (hasta >= 12) add(new Date(base.getFullYear(), base.getMonth(), 12, 10), 48 + rnd() * 30, 'ENEL ENERGIA', 'Hogar/Servicios');
      add(dia(), 5 + rnd() * 20, elegir(['XYZ SRL', 'MERCATINO', 'EDICOLA']), 'Otros');
    }
    const ant = mesAnterior(claveMes(hoy));
    const presupuestos = { 'Comida': 400, 'Transporte': 120, 'Tiempo libre': 80 };
    return {
      movs,
      presupuestos,
      reportes: [{ mes: ant, visto: false, datos: calcular(ant, movs, presupuestos) }]
    };
  }

  function cargar() {
    try { const s = localStorage.getItem(CLAVE); if (s) return JSON.parse(s); } catch (e) { }
    const d = generar(); guardar(d); return d;
  }
  function guardar(d) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { } }

  function enriquecer(m) { const d = new Date(m.fecha); return Object.assign({}, m, { mes: claveMes(d), dia: claveDia(d) }); }

  function calcular(mes, movsCrudos, presupuestos) {
    const todos = movsCrudos.map(enriquecer);
    const delMes = todos.filter(m => m.mes === mes);
    const delAnt = todos.filter(m => m.mes === mesAnterior(mes));
    const por = {};
    CATS.forEach(c => por[c] = { categoria: c, total: 0, cantidad: 0, anterior: 0, presupuesto: presupuestos[c] || 0 });
    let total = 0, totalAnt = 0;
    delMes.forEach(m => { const c = por[m.categoria] ? m.categoria : 'Otros'; por[c].total += m.monto; por[c].cantidad++; total += m.monto; });
    delAnt.forEach(m => { const c = por[m.categoria] ? m.categoria : 'Otros'; por[c].anterior += m.monto; totalAnt += m.monto; });
    const cats = CATS.map(c => Object.assign(por[c], { total: r2(por[c].total), anterior: r2(por[c].anterior), porcentaje: total ? Math.round(por[c].total / total * 1000) / 10 : 0 }));
    const mayor = cats.slice().sort((a, b) => b.total - a.total)[0];
    const lug = {};
    delMes.forEach(m => { lug[m.lugar] = lug[m.lugar] || { lugar: m.lugar, total: 0, cantidad: 0, categoria: m.categoria }; lug[m.lugar].total += m.monto; lug[m.lugar].cantidad++; });
    const top = Object.values(lug).map(x => Object.assign(x, { total: r2(x.total) })).sort((a, b) => b.total - a.total).slice(0, 5);
    const [a, mm] = mes.split('-').map(Number);
    const hoy = new Date();
    const dias = claveMes(hoy) === mes ? hoy.getDate() : new Date(a, mm, 0).getDate();
    const vistos = {}, dup = [];
    delMes.forEach(m => { const k = norm(m.lugar) + '|' + m.monto + '|' + m.dia; if (vistos[k]) dup.push({ lugar: m.lugar, monto: m.monto, dia: m.dia }); vistos[k] = 1; });
    const meses = [mes]; for (let i = 0; i < 3; i++) meses.push(mesAnterior(meses[meses.length - 1]));
    const pl = {};
    todos.filter(m => meses.includes(m.mes)).forEach(m => { const k = norm(m.lugar); pl[k] = pl[k] || { lugar: m.lugar, meses: {}, montos: [] }; pl[k].meses[m.mes] = 1; pl[k].montos.push(m.monto); });
    const rec = Object.values(pl).filter(x => {
      if (Object.keys(x.meses).length < 3) return false;
      const p = x.montos.reduce((s, v) => s + v, 0) / x.montos.length;
      return x.montos.every(v => Math.abs(v - p) <= p * 0.1);
    }).map(x => ({ lugar: x.lugar, montoAprox: x.montos[x.montos.length - 1] }));
    const mg = delMes.slice().sort((x, y) => y.monto - x.monto)[0];
    return {
      mes, total: r2(total), cantidad: delMes.length, totalAnterior: r2(totalAnt),
      variacion: totalAnt ? Math.round((total - totalAnt) / totalAnt * 1000) / 10 : null,
      promedioDiario: r2(dias ? total / dias : 0), categorias: cats,
      mayorCategoria: mayor && mayor.total > 0 ? mayor.categoria : null,
      topLugares: top, mayorGasto: mg || null,
      excedidos: cats.filter(c => c.presupuesto > 0 && c.total > c.presupuesto).map(c => c.categoria),
      posiblesDuplicados: dup, recurrentes: rec
    };
  }

  const acciones = {
    ping: () => ({ ok: true }),
    datos(b, d) {
      const mes = b.mes || claveMes(new Date());
      const todos = d.movs.map(enriquecer);
      const meses = [...new Set(todos.map(m => m.mes).concat([claveMes(new Date())]))].sort().reverse();
      return {
        ok: true, mes, categorias: CATS,
        movimientos: d.movs.filter(m => enriquecer(m).mes === mes),
        presupuestos: d.presupuestos, resumen: calcular(mes, d.movs, d.presupuestos),
        reportes: d.reportes.map(r => ({ mes: r.mes, visto: r.visto })), meses
      };
    },
    agregar(b, d) {
      const m = { id: 'd' + Date.now(), fecha: b.fecha ? new Date(b.fecha).toISOString() : new Date().toISOString(), monto: r2(Number(b.monto)), lugar: b.lugar || 'Sin nombre', categoria: CATS.includes(b.categoria) ? b.categoria : 'Otros', origen: 'manual' };
      d.movs.push(m); return { ok: true, movimiento: m };
    },
    editar(b, d) {
      const m = d.movs.find(x => x.id === b.id); if (!m) throw new Error('No encontrado');
      ['monto', 'lugar', 'categoria'].forEach(k => { if (b[k] !== undefined) m[k] = k === 'monto' ? Number(b[k]) : b[k]; });
      if (b.fecha) m.fecha = new Date(b.fecha).toISOString();
      let n = 0;
      if (b.recordar) d.movs.forEach(x => { if (norm(x.lugar) === norm(m.lugar) && x.categoria !== m.categoria) { x.categoria = m.categoria; n++; } });
      return { ok: true, reclasificados: n };
    },
    borrar(b, d) { d.movs = d.movs.filter(x => x.id !== b.id); return { ok: true }; },
    reporte(b, d) {
      const r = d.reportes.find(x => x.mes === b.mes);
      if (r) return { ok: true, reporte: r.datos, cerrado: true, visto: r.visto };
      return { ok: true, reporte: calcular(b.mes, d.movs, d.presupuestos), cerrado: false };
    },
    marcarVisto(b, d) { d.reportes.forEach(r => { if (r.mes === b.mes) r.visto = true; }); return { ok: true }; },
    presupuestos(b, d) {
      d.presupuestos = {}; CATS.forEach(c => { const v = Number(b.presupuestos[c]); if (v > 0) d.presupuestos[c] = v; });
      return { ok: true, presupuestos: d.presupuestos };
    },
    probar: () => ({ ok: false, error: 'Conecta tu Apps Script para probar notificaciones reales.' })
  };

  root.Demo = {
    async llamar(accion, body) {
      const d = cargar();
      const f = acciones[accion];
      if (!f) return { ok: false, error: 'Acción desconocida' };
      try { const r = f(body || {}, d); guardar(d); return JSON.parse(JSON.stringify(r)); }
      catch (e) { return { ok: false, error: e.message }; }
    },
    reiniciar() { try { localStorage.removeItem(CLAVE); } catch (e) { } }
  };
})(window);
