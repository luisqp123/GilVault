// Ejecuta: node tests/parser.test.js
// Carga el backend de Apps Script en Node y prueba el intérprete de notificaciones.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const src = fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8');
const ctx = { module: { exports: {} }, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const G = ctx.module.exports;
const reglas = G.reglasIniciales_();
const ahora = new Date(2026, 10, 14, 13, 21);

const casos = [
  // Formato de las notificaciones de Intesa Sanpaolo Mobile (título = comercio).
  ['Iliad', '💸 Hai pagato 9,99 € con la carta *1234 il 11.14 alle ore 10:05 da Iliad.',
    { monto: 9.99, lugar: 'Iliad', categoria: 'Hogar/Servicios', dia: 14, mes: 10, hora: 10, min: 5 }],
  ['Conad', '💸 Hai pagato 23,45 € con la carta *1234 il 11.13 alle ore 09:05 da Conad City Milano.',
    { monto: 23.45, lugar: 'Conad City Milano', categoria: 'Comida', dia: 13, mes: 10, hora: 9, min: 5 }],
  ['Amazon.it', '💸 Hai pagato 1.234,56 € con la carta *1234 il 11.02 alle ore 21:47 da Amazon.it.',
    { monto: 1234.56, lugar: 'Amazon.it', categoria: 'Hogar/Servicios', dia: 2, mes: 10, hora: 21 }],
  ['Trattoria Da Gino', '💸 Hai pagato 40,00 € con la carta *1234 il 11.12 alle ore 20:30 da Trattoria Da Gino.',
    { monto: 40, lugar: 'Trattoria Da Gino', categoria: 'Comida', dia: 12 }],
  ['Netflix', '💸 Hai pagato 13,99 € con la carta *1234 il 11.05 alle ore 03:12 da NETFLIX.COM.',
    { monto: 13.99, lugar: 'NETFLIX.COM', categoria: 'Suscripciones', dia: 5 }],

  // [título, texto, esperado (null = ignorada)]
  ['Pagamento con carta', 'Hai effettuato un pagamento di 12,50 EUR presso CONAD SUPERSTORE il 13/11/2026 alle 10:32 con la carta ****1234',
    { monto: 12.5, lugar: 'CONAD SUPERSTORE', categoria: 'Comida', dia: 13, hora: 10 }],
  ['Intesa Sanpaolo', 'Addebito carta di debito: EUR 4,20 c/o BAR SPORT 12/11/26 08:15',
    { monto: 4.2, lugar: 'BAR SPORT', categoria: 'Comida', dia: 12, hora: 8 }],
  ['Acquisto online', 'Acquisto di 9,99 € su NETFLIX.COM con carta XME',
    { monto: 9.99, lugar: 'NETFLIX.COM', categoria: 'Suscripciones' }],
  ['Pagamento', 'Pagamento di 1.234,56 EUR presso IKEA MILANO CORSICO',
    { monto: 1234.56, lugar: 'IKEA MILANO CORSICO', categoria: 'Hogar/Servicios' }],
  ['Pagamento carta', 'Pagamento 15,30 EUR presso UBER EATS',
    { monto: 15.3, lugar: 'UBER EATS', categoria: 'Comida' }],
  ['Pagamento carta', 'Pagamento 22,00 EUR presso UBER TRIP',
    { monto: 22, lugar: 'UBER TRIP', categoria: 'Transporte' }],
  ['Pagamento', 'Pagamento contactless di € 3.80 presso FARMACIA COMUNALE 5',
    { monto: 3.8, lugar: 'FARMACIA COMUNALE 5', categoria: 'Salud' }],
  ['Carta', 'Utilizzo carta per EUR 45,00 presso TRENITALIA WEB',
    { monto: 45, lugar: 'TRENITALIA WEB', categoria: 'Transporte' }],
  ['Carta', 'Pagamento di 60,00 EUR presso TICKETONE SPA',
    { monto: 60, lugar: 'TICKETONE SPA', categoria: 'Tiempo libre' }],
  ['Prelievo', 'Prelievo di 50,00 EUR effettuato il 13/11/2026',
    { monto: 50, lugar: 'Prelievo ATM', categoria: 'Otros' }],
  ['Pagamento', 'Pagamento di 7,00 EUR presso XYZ SRL',
    { monto: 7, lugar: 'XYZ SRL', categoria: 'Otros' }],
  ['Bonifico', 'Ti è stato accreditato un bonifico di 1.200,00 EUR', null],
  ['O-Key', 'Autorizza il pagamento di 25,00 EUR presso AMAZON', null],
  ['Codice', 'Il tuo codice OTP è 123456', null],
  ['Pagamento', 'Pagamento di 10,00 EUR presso ZARA rifiutato', null],
  ['Novità', 'Scopri le nuove funzionalità dell\'app!', null],
];

let ok = 0;
for (const [t, x, esp] of casos) {
  const r = G.interpretarNotificacion(t, x, ahora, reglas);
  try {
    if (esp === null) {
      assert.strictEqual(r.esPago, false, 'debería ignorarse');
    } else {
      assert.strictEqual(r.esPago, true, 'debería ser pago: ' + r.motivo);
      assert.strictEqual(r.monto, esp.monto, 'monto');
      assert.strictEqual(r.lugar, esp.lugar, 'lugar');
      assert.strictEqual(r.categoria, esp.categoria, 'categoría');
      if (esp.dia) assert.strictEqual(r.fecha.getDate(), esp.dia, 'día');
      if (esp.mes !== undefined) assert.strictEqual(r.fecha.getMonth(), esp.mes, 'mes');
      if (esp.hora !== undefined) assert.strictEqual(r.fecha.getHours(), esp.hora, 'hora');
      if (esp.min !== undefined) assert.strictEqual(r.fecha.getMinutes(), esp.min, 'minutos');
    }
    ok++;
  } catch (e) {
    console.log('FALLA:', x, '\n   ', e.message, '\n    obtenido:', JSON.stringify(r));
  }
}

// Una regla aprendida gana a las iniciales.
const aprendidas = reglas.concat([{ clave: 'amazon', categoria: 'Tiempo libre', aprendida: true }]);
assert.strictEqual(G.clasificar('AMAZON MARKETPLACE', aprendidas), 'Tiempo libre');
assert.strictEqual(G.clasificar('AMAZON MARKETPLACE', reglas), 'Hogar/Servicios');
assert.strictEqual(G.clasificar('AMAZON PRIME IT', reglas), 'Suscripciones');
assert.strictEqual(G.clasificar('ENIGMA BAR', reglas), 'Comida');
ok += 4;

console.log(`${ok}/${casos.length + 4} pruebas OK`);
process.exit(ok === casos.length + 4 ? 0 : 1);
