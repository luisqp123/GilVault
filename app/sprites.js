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
    e: '#f2d6a2', E: '#c9a06a', // pergamino / piel
    t: '#1f9a8f', T: '#12655e', // verde azulado
    a: '#2d4f96', A: '#1b2f60', u: '#4a78cf', // azul del sabio (sombrero y túnica)
    h: '#4b4b63', q: '#f2a0b0', // rayas y nariz del gato
    x: '#5a2a6a', X: '#33133d', // mantel de la mesa de tarot
    z: '#1f1b3d', Z: '#29244f' // pared de ladrillo de la tienda
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

  // --- Generado por tools/sabio_grid.py (Sabio Ábaco y moneda giratoria) ---
  Object.assign(S, {
 "sabio_1": [
  "............................",
  "............................",
  "..kkkkkkkkkk................",
  ".kaauaaaaaaAkk..............",
  "kaAkkuaayaaaaAkk............",
  "kakkakuaaaaaaaagk...........",
  ".kaak.kuaaaaaaaygk..........",
  "..kk...kuaaaaaaaaAk.........",
  ".......kuayaaaaaaaAk........",
  ".......kuaaaayaaaaaAk.......",
  "......kuaaaaaaaaaaaAkk......",
  ".....kaaaaaaaaaaaaaaaak.....",
  "....kAAAAAAAAAAAAAAAAAAk....",
  ".....kkkwkkkkkkkkkskAAAk....",
  ".......kwewwwewwwEskkkk.....",
  ".......kweekeeekEEsk........",
  ".......kweeeeEeeEEsk........",
  ".......kwwwwwwwwwwsk........",
  "........kwwwwwwwwskk........",
  ".......kuwwwwwwwwsAAkkkk....",
  ".......kuawwwEEEEEEEEEEEk...",
  ".......kuawwweeeeeeeggeek...",
  ".......kuaaweeellllllleeek..",
  "......kuaaaweeellllleeeeek..",
  "......kuaaaaweellllllleek...",
  "......kuaaaawEEEEEEEEEEEk...",
  "......kuaaaaaaaaaaAAAkkk....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  "......knnnkkkkkkknnnkk......",
  ".......kkk.......kkk........",
  "............................"
 ],
 "sabio_2": [
  "............................",
  "............................",
  "............................",
  "..kkkkkkkkkk................",
  ".kaauaaaaaaAkk..............",
  "kaAkkuaayaaaaAkk............",
  "kakkakuaaaaaaaagk...........",
  ".kaak.kuaaaaaaaygk..........",
  "..kk...kuaaaaaaaaAk.........",
  ".......kuayaaaaaaaAk........",
  ".......kuaaaayaaaaaAk.......",
  "......kuaaaaaaaaaaaAkk......",
  ".....kaaaaaaaaaaaaaaaak.....",
  "....kAAAAAAAAAAAAAAAAAAk....",
  ".....kkkwkkkkkkkkkskAAAk....",
  ".......kwewwwewwwEskkkk.....",
  ".......kweekeeekEEsk........",
  ".......kweeeeEeeEEsk........",
  ".......kwwwwwwwwwwsk........",
  "........kwwwwwwwwskk........",
  ".......kuwwwwwwwwsAAkkkk....",
  ".......kuawwwEEEEEEEEEEEk...",
  ".......kuawwweeeeeeeyyeek...",
  "......kuaaaweeellllllleeek..",
  "......kuaaaweeellllleeeeek..",
  "......kuaaaaweellllllleek...",
  "......kuaaaawEEEEEEEEEEEk...",
  ".....kuaaaaaaaaaaaaAAAkk....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  "......knnnkkkkkkknnnkk......",
  ".......kkk.......kkk........",
  "............................"
 ],
 "sabio_parpadeo": [
  "............................",
  "............................",
  "..kkkkkkkkkk................",
  ".kaauaaaaaaAkk..............",
  "kaAkkuaayaaaaAkk............",
  "kakkakuaaaaaaaagk...........",
  ".kaak.kuaaaaaaaygk..........",
  "..kk...kuaaaaaaaaAk.........",
  ".......kuayaaaaaaaAk........",
  ".......kuaaaayaaaaaAk.......",
  "......kuaaaaaaaaaaaAkk......",
  ".....kaaaaaaaaaaaaaaaak.....",
  "....kAAAAAAAAAAAAAAAAAAk....",
  ".....kkkwkkkkkkkkkskAAAk....",
  ".......kwewwwewwwEskkkk.....",
  ".......kweeEeeeEEEsk........",
  ".......kweeeeEeeEEsk........",
  ".......kwwwwwwwwwwsk........",
  "........kwwwwwwwwskk........",
  ".......kuwwwwwwwwsAAkkkk....",
  ".......kuawwwEEEEEEEEEEEk...",
  ".......kuawwweeeeeeeggeek...",
  ".......kuaaweeellllllleeek..",
  "......kuaaaweeellllleeeeek..",
  "......kuaaaaweellllllleek...",
  "......kuaaaawEEEEEEEEEEEk...",
  "......kuaaaaaaaaaaAAAkkk....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  "......knnnkkkkkkknnnkk......",
  ".......kkk.......kkk........",
  "............................"
 ],
 "sabio_habla_1": [
  "............................",
  "............................",
  "..kkkkkkkkkk................",
  ".kaauaaaaaaAkk..............",
  "kaAkkuaayaaaaAkk............",
  "kakkakuaaaaaaaagk...........",
  ".kaak.kuaaaaaaaygk..........",
  "..kk...kuaaaaaaaaAk.........",
  ".......kuayaaaaaaaAk........",
  ".......kuaaaayaaaaaAk.......",
  "......kuaaaaaaaaaaaAkk......",
  ".....kaaaaaaaaaaaaaaaak.....",
  "....kAAAAAAAAAAAAAAAAAAk....",
  ".....kkkwkkkkkkkkkskAAAk....",
  ".......kwewwwewwwEskkkk.....",
  ".......kweekeeekEEsk........",
  ".......kweeeeEeeEEsk........",
  ".......kwwwwwwwwwwsk........",
  "........kwwwRRRwwskk........",
  ".......kuwwwwwwwwsAAkkkk....",
  ".......kuawwwEEEEEEEEEEEk...",
  ".......kuawwweeeeeeeggeek...",
  ".......kuaaweeellllllleeek..",
  "......kuaaaweeellllleeeeek..",
  "......kuaaaaweellllllleek...",
  "......kuaaaawEEEEEEEEEEEk...",
  "......kuaaaaaaaaaaAAAkkk....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  "......knnnkkkkkkknnnkk......",
  ".......kkk.......kkk........",
  "............................"
 ],
 "sabio_habla_2": [
  "............................",
  "............................",
  "............................",
  "..kkkkkkkkkk................",
  ".kaauaaaaaaAkk..............",
  "kaAkkuaayaaaaAkk............",
  "kakkakuaaaaaaaagk...........",
  ".kaak.kuaaaaaaaygk..........",
  "..kk...kuaaaaaaaaAk.........",
  ".......kuayaaaaaaaAk........",
  ".......kuaaaayaaaaaAk.......",
  "......kuaaaaaaaaaaaAkk......",
  ".....kaaaaaaaaaaaaaaaak.....",
  "....kAAAAAAAAAAAAAAAAAAk....",
  ".....kkkwkkkkkkkkkskAAAk....",
  ".......kwewwwewwwEskkkk.....",
  ".......kweekeeekEEsk........",
  ".......kweeeeEeeEEsk........",
  ".......kwwwwwwwwwwsk........",
  "........kwwwwwwwwskk........",
  ".......kuwwwwwwwwsAAkkkk....",
  ".......kuawwwEEEEEEEEEEEk...",
  ".......kuawwweeeeeeeyyeek...",
  "......kuaaaweeellllllleeek..",
  "......kuaaaweeellllleeeeek..",
  "......kuaaaaweellllllleek...",
  "......kuaaaawEEEEEEEEEEEk...",
  ".....kuaaaaaaaaaaaaAAAkk....",
  ".....kuaaaaaaaaaaaaAAAk.....",
  "......knnnkkkkkkknnnkk......",
  ".......kkk.......kkk........",
  "............................"
 ],
 "gil_1": [
  "....kkkk....",
  "..kkggookk..",
  ".kygggooook.",
  ".kyggOOoook.",
  "kyygOgoooook",
  "kyygOgoooook",
  "kyygOgOOoook",
  "kyyggOOooook",
  ".kygggooook.",
  ".kygggooook.",
  "..kkggookk..",
  "....kkkk...."
 ],
 "gil_2": [
  ".....kk.....",
  "....kgok....",
  "...kggook...",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "...kggook...",
  "....kgok....",
  ".....kk....."
 ],
 "gil_3": [
  "............",
  ".....kk.....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  "....kgok....",
  ".....kk.....",
  "............"
 ],
 "gil_4": [
  ".....kk.....",
  "....kgok....",
  "...kggook...",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "..kyggoook..",
  "...kggook...",
  "....kgok....",
  ".....kk....."
 ]
});
  // --- fin generado ---
  // --- Generado por tools/gato_grid.py (Maese Ronroneo) ---
  Object.assign(S, {
 "gato_1": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmmmmhmmhmMMMMk............",
  "......kmmkkkmmmmkkkMMk............",
  "....kkkhmmmmmmmmmMMMhkkk..........",
  "...ksssmhmmwwqqwwMMhMsssk...k.....",
  "....kkkmmmmwkwwkwMMMMkkk...kgk....",
  "...kssskmmmwwwwwwMMMksssk..kyk....",
  "....kkkmmmmmmmmmmMMMMkkk..koyok...",
  "......kmmmmmmmmmmmMMMk.....kok....",
  ".....kmmmmmwwwwwwmmMMMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwwwwMMMkkkOOOOOkkk",
  "ppppppppwwwppppppwwwpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "gato_2": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmmmmhmmhmMMMMk............",
  "......kmmkkkmmmmkkkMMk............",
  "....kkkhmmmmmmmmmMMMhkkk..........",
  "...ksssmhmmwwqqwwMMhMsssk....k....",
  "....kkkmmmmwkwwkwMMMMkkk....kgk...",
  "...kssskmmmwwwwwwMMMksssk..kgyk...",
  "....kkkmmmmmmmmmmMMMMkkk..koyok...",
  "......kmmmmmmmmmmmMMMk.....kok....",
  ".....kmmmmmwwwwwwmmMMMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwwwwMMMkkkOOOOOkkk",
  "ppppppppwwwppppppwwwpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "gato_3": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmmmmhmmhmMMMMk............",
  "......kmmkkkmmmmkkkMMk............",
  "....kkkhmmmmmmmmmMMMhkkk..........",
  "...ksssmhmmwwqqwwMMhMsssk.........",
  "....kkkmmmmwkwwkwMMMMkkk...kk.....",
  "...kssskmmmwwwwwwMMMksssk.kgyk....",
  "....kkkmmmmmmmmmmMMMMkkk..koyok...",
  "......kmmmmmmmmmmmMMMk.....kok....",
  ".....kmmmmmwwwwwwmmMMMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwwwwMMMkkkOOOOOkkk",
  "ppppppppwwwppppppwwwpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "gato_habla_1": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmwkvhmmhwkvMMk............",
  "......kmmvkvmmmmvkvMMk............",
  "....kkkhmmmmmmmmmMMMhkkk..........",
  "...ksssmhmmwwqqwwMMhMsssk...k.....",
  "....kkkmmmmwkwwkwMMMMkkk...kgk....",
  "...kssskmmmwwRRwwMMMksssk..kyk....",
  "....kkkmmmmmmmmmmMMMMkkk..koyok...",
  "......kmmmmmmmmmmmMMMk.....kok....",
  ".....kmmmmmwwwwwwmmMMMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwwwwMMMkkkOOOOOkkk",
  "ppppppppwwwppppppwwwpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "gato_habla_2": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmmmmhmmhmMMMMk............",
  "......kmmkkkmmmmkkkMMk............",
  "....kkkhmmmmmmmmmMMMhkkk..........",
  "...ksssmhmmwwqqwwMMhMsssk....k....",
  "....kkkmmmmwkwwkwMMMMkkk....kgk...",
  "...kssskmmmwwwwwwMMMksssk..kgyk...",
  "....kkkmmmmmmmmmmMMMMkkk..koyok...",
  "......kmmmmmmmmmmmMMMk.....kok....",
  ".....kmmmmmwwwwwwmmMMMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwwwwMMMkkkOOOOOkkk",
  "ppppppppwwwppppppwwwpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "gato_carta": [
  "..................................",
  "........kk........kk..............",
  ".......kmmk......kMMk.............",
  ".......kmmmk....kMMMk.............",
  ".......kmqmmkkkkMMqMk.............",
  ".......kmmmmhhhhmMMMk.............",
  ".......kmmmmmhhmmMMMk.............",
  "......kmmwkvhmmhwkvMMkkk..........",
  "......kmmvkvmmmmvkveeeeek.........",
  "....kkkhmmmmmmmmmMMegggek.........",
  "...ksssmhmmwwqqwwMMegRgek.........",
  "....kkkmmmmwkwwkwMMegRgek..kk.....",
  "...kssskmmmwwRRwwMMegggek.kgyk....",
  "....kkkmmmmmmmmmmMweeeeek.koyok...",
  "......kmmmmmmmmmmmwwwkkk...kok....",
  ".....kmmmmmwwwwwwmwwwMk....kkk....",
  ".....khhhmmwwwwwwmmhhhk...keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmhhhmmwwwwwwmmhhhMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "....kmmmmmmwwwwwwmmmMMMk..keeEk...",
  "kkkkkmmmwwwwwwwwwxxxMMMkkkOOOOOkkk",
  "ppppppppwwwppppppxxxpppppppppppppp",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxerrexxeCCexxevvexxxxxxxxxxxxxxx",
  "xXxerrexxeCCeXxevvexxXxxxXxxxXxxxx",
  "xxxeeeexxeeeexxeeeexxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ]
});
  // --- fin gato ---
  // --- Generado por tools/tienda_grid.py (tienda mágica, sol y luna) ---
  Object.assign(S, {
 "tienda": [
  "ZZZVZzZVZZZzVAZZZzZZZZZzZZZZZzZZZZZzZZZZZzAZVZZzZVZZZVZZ",
  "zzzzvzzzvzzzzvzzzzzzzzzzzzzzzzzzzzzzzzzzzzAzzvzzzzvzzzvz",
  "zzzvzzzvzzzzvAzzzzzzzzzzAAAAAAAAzzzzzzzzzzAzvzzzzvzzzvzz",
  "zzzzVzzzzzzzzVzzzzzzzzAAuuuuuuuuAAzzzzzzzzAzzVzzzzVzzzVz",
  "zzzvZZZZzZZZvAzZZZZZzAuu...aa...uuAZZZzZZZAZvZZZZZzZZvZZ",
  "zzzzvzzzzzzzzvzzzzzzAu.....aa.....uAzzzzzzAzzvzzzzzzzzvz",
  "zzzzzznzzzzzVAzzzzzAu......aa......uAzzzzzAzVzzzznzzzVzz",
  "zznzzzezzzzzzvzzzzAu.......aa.......uAzzzzAzzzzzzezzznvz",
  "ZZeZZwvvZnnnnAZZZAu........aa........uAZZzAnnnnzwrrZZvZZ",
  "zwppzvvvzCCCCAzzzAu........aa........uAzzzAvvvvzrrrzwccz",
  "zpppzvvvzCwCCAzzAu.........aa.........uAzzAvwvvzrrrzcccz",
  "zpppzvvvzCCCCAzzAu.........aa.........uAzzAvvvvzrrrzcccz",
  "zpppZvvvzCCCCAzZAu.........aa.........uAZZAvvvvZrrrZcccZ",
  "uuuuuuuuuuuuuAzzAu.........aa.........uAzzAuuuuuuuuuuuuu",
  "AAAAAAAAAAAAAAzzAu.........aa.........uAzzAAAAAAAAAAAAAA",
  "zzzzzzzzzzzzzAzzAu.........aa.........uAzzAzzzzzzzzzzzzz",
  "ZZZZZzZZZZZzZAZZAu.........aa.........uAZzAZZZZzZZZZZzZZ",
  "zzzzzzzzzzzzzAzzAu.........aa.........uAzzAzzzzzzzzzzzzz",
  "zzzzzzzzzzzzzAzzAuaaaaaaaaaaaaaaaaaaaauAzzAzzzzzzzzzzzzz",
  "zrrCCzzzzznzzAzzAu.........aa.........uAzzAznzzvvzzCCzzz",
  "zyryCggZzZeZZAzZAu.........aa.........uAZZAZeZZyvrryCZZZ",
  "zrrCCygzzwrrzAzzAu.........aa.........uAzzAwggzvvyrCCzzz",
  "zrrCCggzzrrrzAzzAu.........aa.........uAzzAgggzvvrrCCzzz",
  "zrrCCggzzrrrzAzzAu.........aa.........uAzzAgggzvvrrCCzzz",
  "ZrrCCggZZrrrZAZZAu.........aa.........uAZzAgggZvvrrCCzZZ",
  "uuuuuuuuuuuuuAzzAu.........aa.........uAzzAuuuuuuuuuuuuu",
  "AAAAAAAAAAAAAAzzAu.........aa......v..uAzzAAAAAAAAAAAAAA",
  "zzzzzzzzzzzzzAzzAu.........aa.....V...uAzzAzzzzzzzzzzzzz",
  "zzzZZZZZzZZZZAzZAu.........aa....vvvv.uAZZAZzZZZZZzZZZZZ",
  "zzzzzzzzzzzzzAzzAu.........aa....OOOO.uAzzAzzzzzzzzzzzzz",
  "zzzzzzznzzzzzAzzAu.........aa....OOOO.uAzzAznzzzzzzzzzzz",
  "zzzzzzzezzzzzAzzAu.........aa....OOOO.uAzzAzezzzzzzzzzzz",
  "ZnnnnzwccZZnZAZuuuuuuuuuuuuuuuuuuuuuuuuuuzAwppZnnnnZZnZZ",
  "zOOOOzccczzezAzAAAAAAAAAAAAAAAAAAAAAAAAAAzApppzggggzzezz",
  "zOwOOzccczwppAzzzzzzzzzzzzzzzzzzzzzzzzzzzzApppzgwggzwvvz",
  "zOOOOzccczpppAzzzzzzzzzzzzzzzzzzzzzzzzzzzzApppzggggzvvvz",
  "zOOOOZcccZpppAzZZZZZzZZZZZzZZZZZzZZZZZzZZZApppZggggZvvvZ",
  "uuuuuuuuuuuuuAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAuuuuuuuuuuuuu",
  "AAAAAAAAAAAAAAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAAAAAAAAAAAAAA",
  "zzzzzzzzzzzzzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAzzzzzzzzzzzzz",
  "ZZZZZzZZZZZzZAZZZzZZZZZzZZZZZzZZZZZzZZZZZzAZZZZzZZZZZzZZ",
  "zzzzzzzzzzzzzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAzzzzzzzzzzzzz",
  "zzzzzzzzzzzzzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAzzzzzzzzzznzz",
  "zznzzzzzzzppzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAzzzzzznzzzezz",
  "zzeZZnnnnZypZAzZZZZZzZZZZZzZZZZZzZZZZZzZZZAnnnnZZezZwrrZ",
  "zwvvzrrrrzppzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzACCCCzwOOzrrrz",
  "zvvvzrwrrzppzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzACwCCzOOOzrrrz",
  "zvvvzrrrrzppzAzzzzzzzzzzzzzzzzzzzzzzzzzzzzACCCCzOOOzrrrz",
  "ZvvvZrrrrZppZAZZZzZZZZZzZZZZZzZZZZZzZZZZZzACCCCzOOOZrrrZ",
  "uuuuuuuuuuuuuAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAuuuuuuuuuuuuu",
  "AAAAAAAAAAAAAAzzzzzzzzzzzzzzzzzzzzzzzzzzzzAAAAAAAAAAAAAA",
  "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
  "pppppppppppppppppppppppppppppppppppppppppppppppppppppppp",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 ],
 "sol": [
  "...gg...",
  ".ggyygg.",
  ".gwwyyg.",
  "gywyyyyg",
  "gyyyyyyg",
  ".gyyyyg.",
  ".ggyygg.",
  "...gg..."
 ],
 "luna": [
  "...m....",
  ".mm.....",
  ".mm.....",
  "mmm.....",
  "mmm.....",
  ".msm....",
  ".mmsmmm.",
  "...mm..."
 ]
});
  // --- fin tienda ---

  // --- Cuadros derivados para animaciones ---
  const CATS = ['Comida', 'Salud', 'Transporte', 'Tiempo libre', 'Hogar/Servicios', 'Suscripciones', 'Otros'];
  const subir = g => g.slice(1).concat([g[0].replace(/./g, '.')]);
  CATS.forEach(n => { S[n + '_arriba'] = subir(S[n]); });
  // Cofre con los destellos en otro sitio.
  S.cofre_2 = (() => {
    const g = S.cofre.map((f, y) => f.split('').map((c, x) => (c === 'w' && (x < 4 || x > 27)) ? '.' : c));
    [[28, 3], [3, 9]].forEach(([cx, cy]) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const x = cx + dx, y = cy + dy;
      if (g[y] && g[y][x] === '.') g[y][x] = 'w';
    }));
    return g.map(f => f.join(''));
  })();

  // Animaciones: cuadros y milisegundos por cuadro (ritmo 8-bit, pocas imágenes por segundo).
  const ANIM = {
    gil: { f: ['gil_1', 'gil_2', 'gil_3', 'gil_4'], ms: 170 },
    cofre: { f: ['cofre', 'cofre_2'], ms: 600 }
  };
  CATS.forEach(n => { ANIM[n] = { f: [n, n + '_arriba'], ms: 260 }; });
  ANIM.gato_1 = { f: ['gato_1', 'gato_2', 'gato_3', 'gato_2'], ms: 230 };  // la vela parpadea
  ANIM.gato_habla = { f: ['gato_habla_1', 'gato_habla_2'], ms: 160 };

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

  // SVG píxel a píxel con retardos aleatorios: el sprite "se materializa" (efecto disolver).
  function svgPixeles(nombre, duracion) {
    const g = S[nombre]; const h = g.length, w = g[0].length;
    let rects = '', semilla = 11;
    const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = g[y][x];
      if (ch === '.' || !PAL[ch]) continue;
      // Aparecen de abajo hacia arriba con dispersión, como partículas que se juntan.
      const d = Math.round(((h - y) / h) * duracion * 0.6 + rnd() * duracion * 0.4);
      rects += `<rect class="pxa" style="animation-delay:${d}ms" x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch]}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  root.Sprites = { svg, svgPixeles, grids: S, PAL, ANIM };
  if (typeof module !== 'undefined') module.exports = root.Sprites;
})(typeof window !== 'undefined' ? window : globalThis);
