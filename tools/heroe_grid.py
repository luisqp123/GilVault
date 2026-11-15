# Genera el personaje del usuario (viajero con moño, barba, lentes, mochila y bastón) en
# cuatro estados de energía, más los íconos de las ranuras de equipo. Imprime un objeto JS.
import json

def lienzo(w, h): return [['.'] * w for _ in range(h)]

def contorno(g):
    H, W = len(g), len(g[0])
    m = [[g[y][x] != '.' for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.' and any(0 <= x+dx < W and 0 <= y+dy < H and m[y+dy][x+dx]
                                      for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                g[y][x] = 'k'

def heroe(estado='normal', respira=False):
    W, H = 30, 42
    g = lienzo(W, H)
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): p(x, y, c)
    # desplazamiento del torso y la cabeza según el estado
    dy = {'energia': -1, 'normal': 0, 'cansado': 1, 'agotado': 3}[estado] + (1 if respira else 0)
    dx = 1 if estado == 'agotado' else 0   # se inclina hacia el bastón
    # --- Piernas y botas (fijas) ---
    r(12, 32, 14, 36, 'f'); r(17, 32, 19, 36, 'f')
    r(14, 32, 14, 36, 'F'); r(19, 32, 19, 36, 'F')
    r(12, 36, 14, 37, 'm'); r(17, 36, 19, 37, 'm')               # calcetines
    r(11, 38, 15, 39, 'h'); r(16, 38, 21, 39, 'h')               # botas
    p(13, 38, 'o'); p(19, 38, 'o')                                # detalle naranja
    r(11, 40, 15, 40, 'n'); r(16, 40, 21, 40, 'n')               # suelas
    # --- Pantalón corto gris ---
    sy = 27 + max(0, dy)
    r(11, sy, 20, 31, 'M'); r(11, sy, 20, sy, 'h'); r(15, sy + 1, 16, 31, 'h')
    r(11, sy + 2, 12, sy + 4, 'h')  # bolsillo
    # --- Mochila (detrás, a la izquierda) ---
    by = 12 + dy
    r(4 + dx, by + 2, 11 + dx, by + 17, 'h'); r(5 + dx, by + 3, 10 + dx, by + 16, 'k')
    r(6 + dx, by + 10, 10 + dx, by + 15, 'h')                     # bolsillo frontal
    p(9 + dx, by + 6, 'o')                                        # tirador naranja
    for x in range(3, 13):                                        # esterilla enrollada (acordeón)
        r(x + dx, by - 2, x + dx, by + 1, 'm' if x % 2 else 'M')
    # --- Torso: camiseta azul marino ---
    ty = 17 + dy
    r(11 + dx, ty, 20 + dx, sy - 1, 'A'); r(12 + dx, ty, 13 + dx, ty + 7, 'a')
    r(12 + dx, ty, 12 + dx, ty + 8, 'k')                          # correa de la mochila
    r(12 + dx, ty + 4, 17 + dx, ty + 4, 'k'); p(15 + dx, ty + 4, 'o')  # correa de pecho + hebilla
    # --- Brazo y bastón ---
    if estado == 'agotado':
        r(20 + dx, ty + 1, 21 + dx, ty + 3, 'A'); r(21 + dx, ty + 4, 22 + dx, ty + 6, 'f'); hand_y = ty + 6
    else:
        r(20, ty, 21, ty + 2, 'A'); r(20, ty + 3, 21, ty + 6, 'f'); r(21, ty + 4, 21, ty + 6, 'F'); hand_y = ty + 6
    r(23, 17, 23, 40, 'C'); r(23, hand_y - 1, 23, hand_y + 1, 'k')   # bastón azul y empuñadura
    r(22, hand_y, 23, hand_y + 1, 'f')                                # mano
    # --- Cabeza (grande, estilo chibi) ---
    hy = 1 + dy; hx = dx
    r(13 + hx, hy + 3, 20 + hx, hy + 13, 'f'); r(20 + hx, hy + 4, 20 + hx, hy + 12, 'F')   # cara
    r(14 + hx, hy + 14, 19 + hx, hy + 14, 'f')                                         # mentón
    # pelo rizado arriba y atrás, y moño
    r(12 + hx, hy + 0, 20 + hx, hy + 3, 'j'); r(11 + hx, hy + 2, 13 + hx, hy + 8, 'j')
    for (x, y) in [(13, 0), (15, 1), (17, 0), (19, 1), (12, 4), (12, 6), (14, 2), (18, 2)]: p(x + hx, y + hy, 'J')
    p(20 + hx, hy + 3, 'f')                                        # entradas: frente despejada
    r(8 + hx, hy - 2, 11 + hx, hy + 1, 'j'); p(9 + hx, hy - 1, 'J'); p(10 + hx, hy, 'J')  # moño
    p(11 + hx, hy + 1, 'r')                                        # gomita roja
    # oreja
    r(13 + hx, hy + 8, 13 + hx, hy + 9, 'F')
    # cejas
    r(15 + hx, hy + 5, 16 + hx, hy + 5, 'J'); r(18 + hx, hy + 5, 19 + hx, hy + 5, 'J')
    # lentes redondos (montura gris oscuro) con patilla hacia la oreja
    for cx in (15, 18):
        for (x, y) in [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]:
            p(cx + x + hx, hy + 7 + y, 'h')
    r(13 + hx, hy + 6, 13 + hx, hy + 6, 'h')
    ojo = {'agotado': 'F', 'cansado': 'J'}.get(estado, 'n')
    p(15 + hx, hy + 7, ojo); p(18 + hx, hy + 7, ojo)
    if estado == 'cansado':                                          # párpados caídos
        p(14 + hx, hy + 7, 'F'); p(19 + hx, hy + 7, 'F')
    p(17 + hx, hy + 9, 'F')                                          # nariz
    # barba: bigote y mandíbula, con canas
    r(15 + hx, hy + 10, 19 + hx, hy + 10, 'J')
    r(13 + hx, hy + 11, 20 + hx, hy + 13, 'J'); r(14 + hx, hy + 14, 19 + hx, hy + 14, 'J'); r(14 + hx, hy + 9, 14 + hx, hy + 10, 'J')
    for (x, y) in [(15, 13), (18, 12), (20, 11), (14, 12), (17, 14)]: p(x + hx, y + hy, 'M')
    if estado == 'energia':
        r(16 + hx, hy + 11, 18 + hx, hy + 11, 'w')                   # sonrisa grande
    elif estado == 'agotado':
        p(17 + hx, hy + 11, 'R')
    else:
        r(16 + hx, hy + 11, 17 + hx, hy + 11, 'R')
    contorno(g)
    # gotas de sudor (después del contorno, para que no lleven borde)
    if estado in ('cansado', 'agotado'):
        p(22 + hx, hy + 4, 'c'); p(22 + hx, hy + 5, 'C')
    if estado == 'agotado':
        p(10 + hx, hy + 9, 'c'); p(10 + hx, hy + 10, 'C')
    return [''.join(f) for f in g]

def icono(tipo):
    g = lienzo(12, 12)
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = c
    if tipo == 'cabeza':      # gorro de lana con pompón
        r(2, 5, 9, 9, 'r'); r(2, 9, 9, 10, 'R'); r(5, 2, 6, 4, 'w'); r(3, 6, 8, 6, 'w')
    elif tipo == 'cuerpo':    # chaqueta
        r(2, 2, 9, 10, 'v'); r(5, 2, 6, 10, 'V'); r(0, 3, 1, 8, 'v'); r(10, 3, 11, 8, 'v'); g[5][4] = 'y'; g[7][4] = 'y'
    elif tipo == 'mano':      # bastón con cristal
        r(5, 3, 6, 11, 'b'); r(4, 0, 7, 3, 'c'); g[1][5] = 'w'
    else:                     # brújula / amuleto
        for y in range(12):
            for x in range(12):
                if (x - 5.5) ** 2 + (y - 6) ** 2 <= 20: g[y][x] = 'g'
                if (x - 5.5) ** 2 + (y - 6) ** 2 <= 9: g[y][x] = 'e'
        g[4][5] = 'r'; g[5][5] = 'r'; g[7][6] = 'k'; g[1][5] = 'O'; g[0][5] = 'O'
    contorno(g)
    return [''.join(f) for f in g]

frames = {}
for est in ('energia', 'normal', 'cansado', 'agotado'):
    frames[f'heroe_{est}_1'] = heroe(est)
    frames[f'heroe_{est}_2'] = heroe(est, respira=True)
for t in ('cabeza', 'cuerpo', 'mano', 'accesorio'):
    frames[f'equipo_{t}'] = icono(t)
print(json.dumps(frames, indent=1))
