# 🪙 GilVault

Tu inventario de gastos con estilo de JRPG retro. Cada vez que pagas con la tarjeta, la notificación de **Intesa Sanpaolo** se lee en tu Android y el gasto se guarda automáticamente en tu **Google Sheet**, con su monto, el lugar y una categoría. La app (una PWA instalable) te lo muestra como un inventario y el día 1 de cada mes genera el **reporte del mes anterior** y te avisa.

```
 Notificación del banco ──► MacroDroid ──► Apps Script (tu Google) ──► Google Sheet
   (Android)                (lee y reenvía)   (interpreta y clasifica)       │
                                                                             ▼
                                                     App GilVault (PWA) ◄── datos + reporte mensual
```

**Categorías:** Comida · Salud · Transporte · Tiempo libre · Hogar/Servicios · Suscripciones · Otros

**Funciones:**
- Registro automático de cada pago con tarjeta. Se ignoran ingresos, reembolsos, códigos OTP, solicitudes 3D Secure y pagos rechazados.
- Clasificación automática con ~250 comercios italianos. Cuando corriges una categoría, la app **aprende** ese lugar y reclasifica sus otros gastos.
- **Presupuestos como barras de HP** por categoría. Si te pasas, la categoría queda "K.O.".
- **Reporte mensual** (pantalla "¡VICTORIA!"): total, comparación con el mes anterior, media diaria, gasto por categoría, los 5 lugares donde más gastaste, el gasto más grande, posibles suscripciones y posibles cobros duplicados.
- Aviso de reporte listo: correo + ventana "¡Obtuviste Reporte de…!" al abrir la app. Opcionalmente, una notificación push vía ntfy.
- Añadir gastos manualmente (efectivo, por ejemplo), editarlos o borrarlos ("Tirar objeto").
- Funciona sin conexión mostrando la última copia guardada. Sonidos 8-bit opcionales.
- **Modo demo** con datos de ejemplo mientras no conectes tu Google Sheet.

---

## Instalación (unos 15 minutos, una sola vez)

### Paso 0 — Publicar la app

Al hacer merge a `main`, el workflow ejecuta las pruebas y publica `app/` en GitHub Pages, en `https://<tu-usuario>.github.io/GilVault/`. La primera vez hay que activar **Settings → Pages → Source: GitHub Actions**.

> También puedes publicarla en Netlify (sirve si el repositorio es privado): el archivo `netlify.toml` ya está listo.

### Paso 1 — Copiar el código del script

1. Abre el archivo [`apps-script/Code.gs`](apps-script/Code.gs) y pulsa **Raw** (o el botón de copiar) para ver el código completo.
2. Mantén pulsado el texto → **Seleccionar todo** → **Copiar**.

### Paso 2 — Crear la Google Sheet con el script

> El editor de Apps Script no funciona bien en la vista móvil. En Chrome, toca **⋮ → ☑ Versión para ordenador** antes de abrirlo.

1. Abre **https://sheets.new** (con la versión para ordenador activada) y llama a la hoja **GilVault**.
2. Menú **Extensiones → Apps Script**.
3. Borra lo que haya en el editor, **pega** el código y toca 💾 **Guardar**.
4. En la lista de funciones de arriba elige **`setup`** y toca **▶ Ejecutar**.
   - Google te pedirá permisos. Como el script es tuyo, verás "Google no ha verificado esta app": toca **Configuración avanzada → Ir a GilVault (no seguro) → Permitir**.
5. Toca **Implementar → Nueva implementación** → ⚙️ tipo **Aplicación web**:
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier usuario**. Sin tu token secreto nadie puede leer ni escribir nada.
   - Toca **Implementar**.
6. Ve a **⚙️ Configuración del proyecto → Propiedades del script → Añadir propiedad**: nombre `APP_URL`, valor = la dirección de la app del paso 0. Guarda.
7. En la lista de funciones elige **`conectarTelefono`** y toca **▶ Ejecutar**. Te llegará un **correo "GilVault: conecta tu teléfono"**.

### Paso 3 — Instalar la app

1. Desactiva la versión para ordenador en Chrome.
2. Abre el correo y toca **▶ Conectar mi cofre**. La app se abre ya conectada a tu Google Sheet.
3. En Chrome, toca **⋮ → Añadir a pantalla de inicio → Instalar**. Aparece el ícono del cofre.
4. Opcional: en **Config → Presupuestos (HP)**, pon un límite mensual por categoría.

### Paso 4 — MacroDroid (lee la notificación del banco)

Instala [MacroDroid](https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid). La versión gratis basta. Crea una macro nueva:

**Disparador:** *Notificación → Notificación recibida*
- Aplicación: **Intesa Sanpaolo Mobile**
- Contenido: *Cualquiera*. El script ya descarta lo que no es un pago.
- Concede el **acceso a las notificaciones** cuando te lo pida.

**Acción:** *Interacciones web → Solicitud HTTP*
- Método: **POST**
- URL y parámetros: cópialos del **correo del paso 2**. Son 4 parámetros de consulta: `token`, `accion`, `titulo` y `texto`.
- Para `titulo` y `texto`, usa el botón de **texto mágico** y elige *Título de notificación* y *Texto de notificación*.
- Ignora la respuesta. Que Apps Script responda con una redirección (302) es normal.

**Ajustes de Android:**
- *Ajustes → Aplicaciones → MacroDroid → Batería → **Sin restricciones***.
- En la app del banco, deja activadas las notificaciones de pagos con tarjeta.

> Los nombres de los menús son de la versión actual de MacroDroid y pueden variar un poco según el idioma.

### Paso 5 — Comprobar

- **GilVault → Config → Probar notificación:** pega el texto de una notificación y verás cómo se registraría, sin guardar nada.
- Haz un pago pequeño y revisa que aparezca en **Objetos**.
- La hoja **Notificaciones** de tu Google Sheet registra todo lo que llega, incluido lo que se ignoró y por qué.

### Si cambias el código del script más adelante

Pega el código nuevo y luego **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. Así la URL no cambia.

## Compartir GilVault

Cada persona usa **su propia** Google Sheet y su propio script, así que nadie ve los datos de nadie.

- **No hace falta copiar el repositorio:** la otra persona puede usar la misma app publicada y seguir los pasos 1 a 5 con su cuenta de Google. En la propiedad `APP_URL` pone la dirección de la app que va a usar.
- **Nunca compartas tu URL `/exec` ni tu token**, ni reenvíes el correo de `conectarTelefono`: con esos datos se pueden ver y modificar tus gastos.
- El intérprete está ajustado a las notificaciones de **Intesa Sanpaolo**. Para otros bancos hay que añadir su formato en `interpretarNotificacion` (y una prueba en `tests/parser.test.js`).
- MacroDroid solo existe en Android.

## Opciones extra (Apps Script → Configuración del proyecto → Propiedades del script)

| Propiedad    | Para qué sirve |
|--------------|----------------|
| `APP_URL`    | **Obligatoria.** La dirección de tu app (GitHub Pages o Netlify). |
| `NTFY_TOPIC` | Un nombre secreto inventado, por ejemplo `gilvault-x8k2p`. Instala la app [ntfy](https://play.google.com/store/apps/details?id=io.heckel.ntfy), suscríbete a ese tema y recibirás una **notificación push** cuando el reporte esté listo. |
| `AVISO_EMAIL`| Ponlo en `no` si no quieres el correo de aviso. |

Para generar a mano el reporte de un mes, ejecuta `generarReporte('2026-10')` en el editor de Apps Script.

## Tu Google Sheet

| Hoja | Contenido |
|------|-----------|
| **Movimientos** | Un gasto por fila. Puedes editarla directamente. |
| **Reglas** | Palabra clave → categoría. Las que aprende la app aparecen como `aprendida` y tienen prioridad. |
| **Presupuestos** | El límite mensual de cada categoría (las barras de HP). |
| **Reportes** | Los reportes mensuales cerrados. |
| **Notificaciones** | Registro de todo lo recibido, para diagnosticar problemas. |

## Privacidad

- Tus datos solo están en **tu** Google Sheet. En GitHub solo está el código de la app.
- El token y la URL se guardan únicamente en tu teléfono y en el correo de conexión, que no debes reenviar. Si alguien obtuviera ambos, podría ver tus gastos. En ese caso, borra la propiedad `TOKEN`, ejecuta `setup` y `conectarTelefono` otra vez, y actualiza el token en MacroDroid.

## Desarrollo

```bash
npm test        # pruebas del intérprete de notificaciones y del backend (con Sheets simulado)
npm run dev     # sirve la app en http://localhost:8000 (modo demo)
npm run iconos  # regenera los íconos PNG desde el sprite del cofre
```

Estructura: `apps-script/` (backend) · `app/` (PWA) · `tests/` · `tools/`.

El estilo visual es un homenaje original a los JRPG de 16 bits: los sprites, el ícono y la interfaz son propios y no usan material de ningún juego existente.
