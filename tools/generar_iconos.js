// Genera app/icons/*.png a partir del sprite del cofre. Uso: node tools/generar_iconos.js
const path = require('path');
const { chromium } = require('playwright');
const Sprites = require('../app/sprites.js');

const fondo = 'radial-gradient(circle at 50% 30%, #3550e0 0%, #16218a 55%, #0b1450 100%)';
const ventana = (s) => `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;background:transparent">
  <div style="width:${s * 0.92}px;height:${s * 0.92}px;border-radius:${s * 0.18}px;background:${fondo};
    box-shadow:inset 0 0 0 ${s * 0.035}px #f2f4ff, inset 0 0 0 ${s * 0.06}px #000;display:flex;align-items:center;justify-content:center">
    <div style="width:${s * 0.66}px;height:${s * 0.66}px">${Sprites.svg('cofre')}</div></div></div>`;
const maskable = (s) => `<div style="width:${s}px;height:${s}px;background:${fondo};display:flex;align-items:center;justify-content:center">
  <div style="width:${s * 0.56}px;height:${s * 0.56}px">${Sprites.svg('cofre')}</div></div>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const salidas = [['icon-192.png', 192, ventana], ['icon-512.png', 512, ventana], ['maskable-512.png', 512, maskable]];
  for (const [nombre, s, f] of salidas) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<html><body style="margin:0;background:transparent">${f(s).replace('<svg', '<svg width="100%" height="100%"')}</body></html>`);
    await p.screenshot({ path: path.join(__dirname, '../app/icons', nombre), omitBackground: true });
  }
  await b.close();
  console.log('Íconos generados.');
})();
