// El aventurero: estado según los gastos del mes, atributos y botín mensual equipable.
// Todo se calcula en el teléfono; el inventario se guarda en el navegador (localStorage).
(function (root) {
  const ATRIBUTOS = ['STR', 'AGI', 'MP', 'DEF'];
  const RANURAS = { cabeza: 'Cabeza', cuerpo: 'Cuerpo', mano: 'Mano', accesorio: 'Accesorio' };

  // [nombre, ranura]. Los atributos se sortean al encontrarlo.
  const OBJETOS = [
    ['Gorro de lana del Atacama', 'cabeza'], ['Bandana del sendero', 'cabeza'], ['Lentes de glaciar', 'cabeza'],
    ['Sombrero de ala ancha', 'cabeza'], ['Linterna frontal', 'cabeza'], ['Capucha del peregrino', 'cabeza'],
    ['Chaqueta impermeable', 'cuerpo'], ['Poncho de alpaca', 'cuerpo'], ['Camiseta técnica sudada', 'cuerpo'],
    ['Chaleco de mil bolsillos', 'cuerpo'], ['Forro polar de oferta', 'cuerpo'], ['Capa del mercader', 'cuerpo'],
    ['Bastón de trekking gastado', 'mano'], ['Cámara analógica de 35 mm', 'mano'], ['Termo de café eterno', 'mano'],
    ['Mapa de las ofertas', 'mano'], ['Navaja multiusos', 'mano'], ['Cantimplora abollada', 'mano'],
    ['Brújula oxidada', 'accesorio'], ['Pulsera roja de la suerte', 'accesorio'], ['Llavero del refugio', 'accesorio'],
    ['Moneda de la fuente', 'accesorio'], ['Calcetines de repuesto', 'accesorio'], ['Cuaderno de cuentas', 'accesorio']
  ];

  const RAREZAS = {
    comun: { nombre: 'Común', color: '#c9c9d9' },
    raro: { nombre: 'Raro', color: '#5aa8ff' },
    epico: { nombre: 'Épico', color: '#c27bff' },
    maldito: { nombre: 'Maldito', color: '#ff6f6f' }
  };

  const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const azar = a => a[Math.floor(Math.random() * a.length)];
  const limitar = (n, a = 0, b = 99) => Math.max(a, Math.min(b, Math.round(n)));

  // La energía del mes anterior mejora (o empeora) la suerte del botín.
  function sortearRareza(energia) {
    const e = energia == null ? 50 : energia;
    const pesos = { comun: 50, raro: 28, epico: 10, maldito: 12 };
    if (e >= 75) { pesos.comun -= 15; pesos.raro += 7; pesos.epico += 8; pesos.maldito -= 6; }
    else if (e < 25) { pesos.epico -= 5; pesos.maldito += 13; pesos.comun -= 8; }
    let tirada = Math.random() * Object.values(pesos).reduce((a, b) => a + b, 0);
    for (const [k, v] of Object.entries(pesos)) { if ((tirada -= v) <= 0) return k; }
    return 'comun';
  }

  function generarObjeto(mes, energia) {
    const [nombre, ranura] = azar(OBJETOS);
    const rareza = sortearRareza(energia);
    const [a, b] = ATRIBUTOS.slice().sort(() => Math.random() - 0.5);
    const mods = {};
    if (rareza === 'comun') mods[a] = ent(2, 4);
    if (rareza === 'raro') { mods[a] = ent(4, 6); mods[b] = ent(1, 3); }
    if (rareza === 'epico') { mods[a] = ent(6, 9); mods[b] = ent(3, 5); }
    if (rareza === 'maldito') { mods[a] = ent(4, 7); mods[b] = -ent(4, 8); }
    return {
      id: mes + '-' + Math.random().toString(36).slice(2, 7),
      nombre: rareza === 'maldito' ? nombre + ' (maldito)' : nombre,
      ranura, rareza, mods, mes
    };
  }

  // Estado del mes en curso a partir de los datos de la app.
  function calcularEstado(datos, hoy) {
    const r = datos.resumen, pres = datos.presupuestos || {};
    const [a, m] = r.mes.split('-').map(Number);
    const diasMes = new Date(a, m, 0).getDate();
    const esActual = hoy.getFullYear() === a && hoy.getMonth() + 1 === m;
    const dias = esActual ? hoy.getDate() : diasMes;
    const limite = Object.values(pres).reduce((s, v) => s + v, 0);

    // Energía: ritmo de gasto frente al ritmo "ideal" del presupuesto.
    let energia;
    if (limite > 0) {
      const ritmo = (r.total / limite) / (dias / diasMes);
      // ritmo 0,6 → 100 · 1,0 (justo al ritmo) → 64 · 1,25 → 41 · 1,6 o más → ~10
      energia = limitar(100 - (ritmo - 0.6) * 90, 0, 100);
    } else {
      energia = r.variacion == null ? 60 : limitar(60 - r.variacion / 2, 0, 100);
    }
    const estado = energia >= 75 ? 'energia' : energia >= 50 ? 'normal' : energia >= 25 ? 'cansado' : 'agotado';

    // Atributos base (0–99).
    const conPres = r.categorias.filter(c => c.presupuesto > 0);
    const STR = conPres.length ? limitar(conPres.filter(c => c.total <= c.presupuesto).length / conPres.length * 99) : 60;
    const diasConGasto = new Set(datos.movimientos.map(x => x.fecha.slice(0, 10))).size;
    const AGI = limitar((1 - diasConGasto / Math.max(1, dias)) * 99 + 20);
    const MP = limite > 0 ? limitar((limite - r.total) / limite * 99) : 50;
    const DEF = r.variacion == null ? 50 : limitar(50 - r.variacion);
    const nivel = Math.max(1, (datos.meses || []).length);
    return { energia, estado, base: { STR, AGI, MP, DEF }, nivel };
  }

  // Suma los modificadores del equipo puesto.
  function aplicarEquipo(base, inv) {
    const bonus = { STR: 0, AGI: 0, MP: 0, DEF: 0 };
    Object.values(inv.equipo || {}).forEach(id => {
      const o = inv.objetos.find(x => x.id === id);
      if (o) Object.entries(o.mods).forEach(([k, v]) => { bonus[k] += v; });
    });
    const total = {};
    ATRIBUTOS.forEach(k => { total[k] = limitar(base[k] + bonus[k]); });
    return { total, bonus };
  }

  const TEXTO_ESTADO = {
    energia: ['¡Lleno de energía!', 'Tus gastos van por debajo del ritmo del presupuesto.'],
    normal: ['En forma', 'Gastas más o menos al ritmo previsto.'],
    cansado: ['Cansado', 'Vas algo por encima del ritmo del presupuesto.'],
    agotado: ['Agotado', 'Tu bolsa pesa: gastas mucho más rápido de lo previsto.']
  };

  const AYUDA = {
    STR: 'Fuerza de voluntad: categorías que siguen dentro de su presupuesto.',
    AGI: 'Agilidad: días del mes en que no gastaste nada.',
    MP: 'Maná: presupuesto total que aún te queda.',
    DEF: 'Defensa: gastas menos que el mes anterior.'
  };

  root.Aventura = { ATRIBUTOS, RANURAS, RAREZAS, generarObjeto, calcularEstado, aplicarEquipo, TEXTO_ESTADO, AYUDA };
})(window);
