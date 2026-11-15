# Extrae las animaciones del aventurero desde la hoja de sprites del usuario.
#   Entrada: arte/adventurero_sprite_sheet.svg (pixel art vectorizado, cuadrados de 3x3)
#   Salida:  app/heroe/<animacion>.png (tiras horizontales de cuadros) y app/heroe/meta.json
# Uso: python3 tools/extraer_heroe.py
# No modifica el dibujo: reconstruye la cuadrícula original, quita las etiquetas de texto y los
# puntitos de fondo, separa cada cuadro y los alinea (por los pies, o por la cabeza en la fogata).
import re, os, json, collections
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG = os.path.join(RAIZ, 'arte', 'adventurero_sprite_sheet.svg')
SALIDA = os.path.join(RAIZ, 'app', 'heroe')
PX = 3   # tamaño de cada píxel en el SVG

# Filas de la hoja: (y inicial, y final, centros aproximados de cada cuadro), en píxeles nativos.
FILAS = {
    'idle':     (3, 57,   [55, 100, 145, 187, 230, 272, 315]),
    'caminata': (58, 114, [54, 100, 145, 187, 230, 274, 315, 360]),
    'vuelta':   (114, 172, [42, 80, 117, 155, 192, 230, 267, 302]),
    'fogata':   (174, 224, [62, 115, 165, 210, 257, 305, 352, 397, 442, 482]),
    'hechizo':  (226, 284, [55, 112, 160, 215, 272, 330, 385, 465]),
    'cansado':  (284, 341, [55, 100, 142, 187, 255]),
}
ETIQUETAS = [(3, 5, 38, 20), (3, 58, 46, 72), (3, 114, 82, 128), (3, 172, 40, 186), (3, 226, 60, 246), (3, 282, 44, 296)]

def reconstruir():
    s = open(SVG, encoding='utf-8').read()
    w, h = [int(v) for v in re.search(r'viewBox="0 0 (\d+) (\d+)"', s).groups()]
    im = Image.new('RGBA', (w // PX, h // PX + 1), (0, 0, 0, 0)); px = im.load()
    for attrs, cuerpo in re.findall(r'<g([^>]*)>(.*?)</g>', s, re.S):
        col = re.search(r'fill="#([0-9a-fA-F]{6})"', attrs).group(1)
        op = re.search(r'fill-opacity="([\d.]+)"', attrs)
        rgba = (int(col[0:2], 16), int(col[2:4], 16), int(col[4:6], 16), round((float(op.group(1)) if op else 1) * 255))
        for x, y, ww, hh in re.findall(r'<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"', cuerpo):
            for yy in range(int(y) // PX, (int(y) + int(hh)) // PX):
                for xx in range(int(x) // PX, (int(x) + int(ww)) // PX):
                    px[xx, yy] = rgba
    return im

def limpiar_hoja(im):
    p = im.load(); W, H = im.size
    for y in range(H):                      # neblina: puntos poco opacos que no son brillo azul ni fuego
        for x in range(W):
            r, g, b, a = p[x, y]
            if 0 < a < 100 and not (b > r + 30 or (r > 180 and g > 100 and b < 110)):
                p[x, y] = (0, 0, 0, 0)
    paleta = set(p[x, y][:3] for x in range(5, 36) for y in range(7, 19) if p[x, y][3])   # colores de la etiqueta IDLE
    for (x0, y0, x1, y1) in ETIQUETAS:
        for y in range(y0, y1):
            for x in range(x0, x1):
                if p[x, y][3] and p[x, y][:3] in paleta: p[x, y] = (0, 0, 0, 0)

def componentes(A, a, b, y0, y1):
    vis = set(); out = []
    for y in range(y0, y1):
        for x in range(a, b):
            if A[x, y] > 0 and (x, y) not in vis:
                q = collections.deque([(x, y)]); vis.add((x, y)); pts = []; toca = False
                while q:
                    u, v = q.popleft(); pts.append((u, v))
                    if u in (a, b - 1): toca = True
                    for s, t in ((u+1, v), (u-1, v), (u, v+1), (u, v-1), (u+1, v+1), (u-1, v-1), (u+1, v-1), (u-1, v+1)):
                        if a <= s < b and y0 <= t < y1 and A[s, t] > 0 and (s, t) not in vis:
                            vis.add((s, t)); q.append((s, t))
                out.append((pts, toca))
    return out

def cortar(im, y0, y1, centros):
    A = im.getchannel('A').load(); p = im.load(); W = im.size[0]
    dens = [sum(1 for y in range(y0, y1) if A[x, y] > 0) for x in range(W)]
    cortes = [min(range((c0 + c1) // 2 - 8, (c0 + c1) // 2 + 9), key=lambda x: dens[x]) for c0, c1 in zip(centros, centros[1:])]
    lims = [max(0, centros[0] - 40)] + cortes + [min(W, centros[-1] + 45)]
    cuadros = []
    for i in range(len(lims) - 1):
        cs = componentes(A, lims[i], lims[i + 1], y0, y1)
        mayor = max(cs, key=lambda c: len(c[0]))
        mx0 = min(u for u, v in mayor[0]); mx1 = max(u for u, v in mayor[0])
        my0 = min(v for u, v in mayor[0]); my1 = max(v for u, v in mayor[0])
        pts = []
        for c, toca in cs:
            if c is not mayor[0] and toca and len(c) <= 0.25 * len(mayor[0]): continue   # trozos del cuadro vecino
            if c is not mayor[0] and len(c) <= 40:                                       # partículas: solo si están cerca
                cx = sum(u for u, v in c) / len(c); cy = sum(v for u, v in c) / len(c)
                if max(mx0 - cx, 0, cx - mx1) > 10 or max(my0 - cy, 0, cy - my1) > 10: continue
            pts += c
        xs = [q[0] for q in pts]; ys = [q[1] for q in pts]; bx, by = min(xs), min(ys)
        c = Image.new('RGBA', (max(xs) - bx + 1, max(ys) - by + 1), (0, 0, 0, 0)); cp = c.load()
        for (u, v) in pts: cp[u - bx, v - by] = p[u, v]
        cuadros.append((c, bx, by))
    return cuadros

def ancla(c, abajo=True):
    a = c.getchannel('A').load(); w, h = c.size
    filas = range(max(0, h - 6), h - 1) if abajo else range(0, min(h, 10))
    xs = [x for y in filas for x in range(w) if a[x, y] > 200] or [w / 2]
    return sum(xs) / len(xs)

def guardar_tira(nombre, cuadros, anclas):
    izq = max(anclas); der = max(c.size[0] - an for c, an in zip(cuadros, anclas))
    alto = max(c.size[1] for c in cuadros); ancho = int(izq + der) + 2
    t = Image.new('RGBA', (ancho * len(cuadros), alto), (0, 0, 0, 0))
    for i, (c, an) in enumerate(zip(cuadros, anclas)):
        t.alpha_composite(c, (int(i * ancho + izq - an), alto - c.size[1]))
    t.save(os.path.join(SALIDA, nombre + '.png'), optimize=True)
    return {'cuadros': len(cuadros), 'ancho': ancho, 'alto': alto, 'pie': round(izq / ancho, 3)}

def main():
    os.makedirs(SALIDA, exist_ok=True)
    im = reconstruir(); limpiar_hoja(im)
    meta = {}
    for n in ('idle', 'caminata', 'vuelta', 'cansado'):
        cs = [c for c, x, y in cortar(im, *FILAS[n])]
        meta[n] = guardar_tira(n, cs, [ancla(c) for c in cs])
    cs = [c for c, x, y in cortar(im, *FILAS['fogata'])][:8]          # los dos últimos son solo el fuego
    meta['fogata'] = guardar_tira('fogata', cs, [ancla(c, abajo=False) for c in cs])
    h = cortar(im, *FILAS['hechizo'])                                  # 0-4 personaje, 5-6 rayo, 7 cierre
    base, bx, by = h[4]; extra = []
    for k in (5, 6):
        rayo, rx, ry = h[k]
        x0, y0 = min(bx, rx), min(by, ry)
        c = Image.new('RGBA', (max(bx + base.width, rx + rayo.width) - x0, max(by + base.height, ry + rayo.height) - y0), (0, 0, 0, 0))
        c.alpha_composite(base, (bx - x0, by - y0)); c.alpha_composite(rayo, (rx - x0, ry - y0))
        extra.append((c, bx - x0 + ancla(base)))
    cs = [c for c, x, y in h[:5]] + [c for c, a in extra] + [h[7][0]]
    an = [ancla(c) for c, x, y in h[:5]] + [a for c, a in extra] + [ancla(h[7][0])]
    meta['hechizo'] = guardar_tira('hechizo', cs, an)
    json.dump(meta, open(os.path.join(SALIDA, 'meta.json'), 'w'), indent=1)
    print(json.dumps(meta))

if __name__ == '__main__':
    main()
