// Sprites pixel art originales de GilVault.
// Cada sprite es una cuadrícula de caracteres; cada carácter es un color de la paleta ('.' = transparente).
(function (root) {
  const PAL = {
    k: '#1b1024', // contorno
    w: '#ffffff',
    s: '#d8dcf0', // brillo suave
    // madera
    n: '#5a2d0c', b: '#8f4b1b', l: '#c07434',
    // metal
    m: '#e3e3ef', M: '#8a8aa3',
    // oro
    y: '#fff4a3', g: '#ffd23f', o: '#e0921a', O: '#a8620c',
    // rojo / verde / azul / morado
    r: '#e2393b', R: '#9c1d2b', v: '#5fd068', V: '#2f8a3c',
    c: '#7fe3ff', C: '#2a8fd6', p: '#c27bff', P: '#7a3cc2',
    e: '#f2d6a2', E: '#c9a06a' // pergamino
  };

  const S = {
    // Cofre abierto lleno de giles (32x32, generado con tools/cofre_grid.py) — ícono de la app.
    cofre: [
      '................................',
      '................................',
      '.....kkkkkkkkkkkkkkkkkkkkkk.....',
      '....kllllllllllllllllllllllk....',
      '..w.kllllllllllllllllllllllk....',
      '.wwwkmmbbbbbbbbbbbbbbbbbbmmk....',
      '..w.kmmbbbbbbbbbbbbbbbbbbmmk....',
      '....kmmbbbbgggggyyooobbbbmmk....',
      '....kmMbggggggyykOoooooobmMk.w..',
      '....kngggyygggkOggggyyoooonkwww.',
      '....kggggkOgggggggggkOgooook.w..',
      '...kggggggggyygggyyggggyyoook...',
      '...kgggyygggkOgggkOggggkOoook...',
      '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
      '..kllllllllllllllllllllllllllk..',
      '..kllllllllllllllllllllllllllk..',
      '..kmmbbbbbbbbbbbbbbbbbbbbbbmmk..',
      '..kmmbbbbbbbbyyyyyybbbbbbbbmmk..',
      '..kmMbbbbbbbbggggoobbbbbbbbmMk..',
      '..kbbbbbbbbbbggkkoobbbbbbbbbbk..',
      '..kbbbbbbbbbbggkkoobbbbbbbbbbk..',
      '..knnnnnnnnnnggkgoonnnnnnnnnnk..',
      '..kbbbbbbbbbbggggoobbbbbbbbbbk..',
      '..kmmbbbbbbbbbbbbbbbbbbbbbbmmk..',
      '..kmmbbbbbbbbbbbbbbbbbbbbbbmmk..',
      '..kmMbbbbbbbbbbbbbbbbbbbbbbmMk..',
      '..kbbbbbbbbbbbbbbbbbbbbbbbbbbk..',
      '..knnnnnnnnnnnnnnnnnnnnnnnnnnk..',
      '...kkyggkkkkkkkkkkkkkkkkyggkk...',
      '....kggokyggk..........kggok....',
      '.....kkkkggok...........kkk.....',
      '.........kkk....................'

    ],
    // Moneda (12x12)
    gil: [
      '....kkkk....',
      '..kkggggkk..',
      '.kgyyggggok.',
      '.kgykkkkgok.',
      'kgykggggkgok',
      'kgykgggggook',
      'kggkggkkgook',
      'kgokgggkgook',
      '.kgokkkkgok.',
      '.kgoooooook.',
      '..kkooookk..',
      '....kkkk....'
    ],
    // Comida: manzana
    'Comida': [
      '......kk....',
      '.....kVk....',
      '..kkkkvkkk..',
      '.krrrrkrrrk.',
      'krwwrrrrrrRk',
      'krwrrrrrrrRk',
      'krrrrrrrrrRk',
      'krrrrrrrrrRk',
      'krrrrrrrrRRk',
      '.krrrrrrRRk.',
      '..kkRRRRkk..',
      '....kkkk....'
    ],
    // Salud: poción
    'Salud': [
      '....kkkk....',
      '....knnk....',
      '....kkkk....',
      '.....kck....',
      '....kwcck...',
      '...kwvvvvk..',
      '..kwvvvvvvk.',
      '..kvvvvvvVk.',
      '..kvvvvvvVk.',
      '..kvvvvvVVk.',
      '...kVVVVVk..',
      '....kkkkk...'
    ],
    // Transporte: bota alada
    'Transporte': [
      '....kkkkk...',
      '....kCCCk...',
      '....kCcCk...',
      '....kCCCkkk.',
      'kk..kCCCkwk.',
      'kwk.kCCCkwwk',
      '.kwkkCCCCkk.',
      '..kkCCCCCCk.',
      '...kCCCCCCCk',
      '..kCCCCCCCCk',
      '..kMMMMMMMMk',
      '..kkkkkkkkkk'
    ],
    // Tiempo libre: estrella
    'Tiempo libre': [
      '.....kk.....',
      '....kyyk....',
      '....kygk....',
      'kkkkkyggkkkk',
      'kyyyyggggggk',
      '.kgyggggggk.',
      '..kgggggok..',
      '..kggggggk..',
      '.kggokkoggk.',
      '.kgok..kogk.',
      'kgok....kogk',
      'kkk......kkk'
    ],
    // Hogar/Servicios: casa
    'Hogar/Servicios': [
      '.....kk.....',
      '....krrk....',
      '...krrrRk...',
      '..krrrrrRk..',
      '.krrrrrrrRk.',
      'kkkkkkkkkkkk',
      '.keeeeeeeEk.',
      '.kekkeeeeEk.',
      '.kekcekbbEk.',
      '.kekkekbbEk.',
      '.keeeekbgEk.',
      '.kkkkkkkkkk.'
    ],
    // Suscripciones: pergamino
    'Suscripciones': [
      '.kkkkkkkkk..',
      'kEeeeeeeeEk.',
      'kkEeeeeeeekk',
      '.keEEEEEEek.',
      '.keeeeeeeek.',
      '.keEEEEEeek.',
      '.keeeeeeeek.',
      '.keEEEEEEek.',
      '.keeeeeekrk.',
      'kkeeeeekrRkk',
      'kEeeeeeekkEk',
      '.kkkkkkkkkk.'
    ],
    // Otros: bolsa
    'Otros': [
      '....kkkk....',
      '...kllllk...',
      '....kkkk....',
      '...kbllbk...',
      '..kbllllbk..',
      '.kbllllllbk.',
      'kbllgggllbbk',
      'kblllglllbbk',
      'kbllgggllbbk',
      'kbbllllllbbk',
      '.kbbbbbbbbk.',
      '..kkkkkkkk..'
    ],
    // Cursor: manita
    mano: [
      '............',
      '.kkkkk......',
      'kwwwwwkkkk..',
      'kwwwwwwwwwk.',
      'kwwwwwkkkkk.',
      'kwwwwwwwwk..',
      'kwwwwwkkkk..',
      'kswwwwwwwk..',
      '.kssswkkk...',
      '..kkkkk.....',
      '............',
      '............'
    ]
  };

  function svg(nombre, px) {
    const g = S[nombre] || S.Otros;
    const h = g.length, w = g[0].length;
    let rects = '';
    for (let y = 0; y < h; y++) {
      // Agrupa píxeles contiguos del mismo color en una sola fila de rect.
      let x = 0;
      while (x < w) {
        const ch = g[y][x];
        let x2 = x + 1;
        while (x2 < w && g[y][x2] === ch) x2++;
        if (ch !== '.' && PAL[ch]) rects += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${PAL[ch]}"/>`;
        x = x2;
      }
    }
    const size = px ? ` width="${px}" height="${px * h / w}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size} shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  root.Sprites = { svg, grids: S, PAL };
  if (typeof module !== 'undefined') module.exports = root.Sprites;
})(typeof window !== 'undefined' ? window : globalThis);
