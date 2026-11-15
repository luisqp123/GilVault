# Genera el personaje del usuario en alta densidad (48x68): viajero con pelo rizado recogido
# en moño, barba con canas, lentes, camiseta azul marino, pantalón ancho con pliegues
# recogido bajo la rodilla, vendas en las pantorrillas, botas, mochila con esterilla y bastón.
# Cuatro estados de energía x 2 cuadros, más los íconos de las ranuras de equipo.
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
    W, H = 48, 68
    g = lienzo(W, H)
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): p(x, y, c)
    def elipse(cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: p(x, y, c)

    dy = {'energia': -1, 'normal': 0, 'cansado': 2, 'agotado': 4}[estado] + (1 if respira else 0)
    dx = 2 if estado == 'agotado' else 0          # se inclina hacia el bastón

    # ---------------- Piernas: pantalón ancho con pliegues, vendas y botas (fijas) ----------------
    for (x0, x1) in ((18, 27), (29, 38)):          # dos perneras abombadas
        for y in range(45, 58):
            t = (y - 45) / 12
            ancho = 1 + int(3.4 * (1 - (2 * t - 1) ** 2))   # abombado: más ancho a media pierna
            a, b = x0 - ancho + (1 if y > 55 else 0), x1 + ancho - (1 if y > 55 else 0)
            r(a, y, b, y, 'M'); r(a, y, a + 1, y, 'B'); r(b - 2, y, b, y, 'G')
    r(28, 45, 28, 54, 'G')                          # entrepierna
    for (x, y) in [(20, 47), (21, 48), (22, 49), (23, 50), (31, 47), (32, 48), (33, 49), (34, 50),
                   (24, 52), (25, 53), (26, 54), (35, 52), (36, 53), (37, 54), (19, 51), (30, 51)]:
        p(x, y, 'G')                                 # pliegues diagonales
    for (x, y) in [(21, 49), (22, 50), (32, 49), (33, 50), (25, 54), (36, 54)]:
        p(x, y, 'h')                                 # fondo de los pliegues
    for (x, y) in [(19, 47), (20, 48), (30, 47), (31, 48)]:
        p(x, y, 'B')                                 # brillo sobre los pliegues
    r(20, 56, 26, 57, 'G'); r(31, 56, 37, 57, 'G')  # dobladillo recogido
    for (x0, x1) in ((20, 25), (31, 36)):           # vendas en la pantorrilla
        for y in range(58, 62):
            r(x0, y, x1, y, 'e' if y % 2 else 'E')
    for (x0, x1) in ((18, 26), (30, 39)):           # botas de montaña
        r(x0 + 1, 62, x1, 64, 'h'); r(x0, 64, x1 + 1, 65, 'h')
        r(x0, 66, x1 + 1, 66, 'j'); p(x0 + 3, 62, 'o'); p(x0 + 5, 63, 'o')
        r(x0 + 1, 62, x0 + 2, 63, 'G')

    # ---------------- Mochila (detrás) con esterilla enrollada ----------------
    by = 22 + dy; bx = dx
    r(6 + bx, by, 21 + bx, by + 25, 'h'); r(7 + bx, by + 1, 9 + bx, by + 24, 'G')
    r(10 + bx, by + 12, 20 + bx, by + 22, 'G'); r(10 + bx, by + 12, 20 + bx, by + 12, 'k')
    r(14 + bx, by + 15, 16 + bx, by + 15, 'o')      # tirador naranja del bolsillo
    r(19 + bx, by + 2, 20 + bx, by + 10, 'j')       # costura lateral
    for x in range(4, 23):                          # esterilla tipo acordeón
        c = 'm' if (x // 2) % 2 else 'B'
        r(x + bx, by - 7, x + bx, by - 1, c)
    r(4 + bx, by - 4, 22 + bx, by - 4, 'G')         # correa que la sujeta

    # ---------------- Torso: camiseta azul marino ----------------
    ty = 27 + dy; tx = dx
    r(19 + tx, ty, 36 + tx, 44, 'a'); r(19 + tx, ty, 21 + tx, 44, 'u'); r(33 + tx, ty, 36 + tx, 44, 'A')
    r(24 + tx, ty, 31 + tx, ty, 'A')                # cuello
    for (x, y) in [(27, 6), (28, 7), (26, 9), (29, 10)]: p(x + tx, ty + y, 'A')   # dibujo de montañas
    r(22 + tx, ty, 23 + tx, 44, 'k'); r(22 + tx, ty + 1, 22 + tx, 42, 'h')         # correa de hombro
    r(22 + tx, ty + 7, 31 + tx, ty + 7, 'k'); r(26 + tx, ty + 6, 27 + tx, ty + 8, 'o')  # correa de pecho + hebilla
    r(19, 44, 37, 45, 'n'); r(27, 44, 28, 45, 'g')  # cinturón con hebilla

    # ---------------- Brazo y bastón ----------------
    if estado == 'agotado':
        r(36 + tx, ty + 1, 38 + tx, ty + 5, 'a'); r(37 + tx, ty + 6, 39 + tx, ty + 10, 'f'); mano_y = ty + 11
    else:
        r(35, ty + 1, 38, ty + 6, 'a'); r(38, ty + 1, 38, ty + 6, 'A')
        r(36, ty + 7, 38, ty + 13, 'f'); r(38, ty + 8, 38, ty + 13, 'F'); mano_y = ty + 13
    r(41, 25, 42, 66, 'C'); r(41, 25, 41, 66, 'c')                     # bastón azul
    r(40, 22, 43, 24, 'k'); r(41, mano_y - 2, 42, mano_y + 3, 'k')     # pomo y empuñadura
    r(38, mano_y, 41, mano_y + 2, 'f'); r(39, mano_y + 2, 41, mano_y + 2, 'F')   # mano
    r(41, 64, 42, 66, 'h')                                             # punta

    # ---------------- Cabeza (grande, estilo chibi) ----------------
    hy = 1 + dy; hx = dx
    elipse(27.5 + hx, 15 + hy, 9, 11, 'f')                             # cara
    for y in range(6 + hy, 26 + hy):                                   # sombra del lado derecho
        for x in range(33 + hx, 38 + hx):
            if g[y][x] == 'f': p(x, y, 'F')
    # pelo rizado: casquete y parte de atrás
    elipse(26 + hx, 8 + hy, 10, 6.5, 'j')
    r(17 + hx, 8 + hy, 21 + hx, 19 + hy, 'j')
    for y in range(3 + hy, 19 + hy):                                   # textura de rizos
        for x in range(16 + hx, 37 + hx):
            if g[y][x] == 'j' and (x * 3 + y * 5) % 7 == 0: p(x, y, 'J')
    r(22 + hx, 11 + hy, 35 + hx, 12 + hy, 'f')                         # frente despejada
    elipse(14 + hx, 5 + hy, 4, 4, 'j'); p(13 + hx, 4 + hy, 'J'); p(15 + hx, 6 + hy, 'J')   # moño
    r(17 + hx, 6 + hy, 18 + hx, 7 + hy, 'r')                           # gomita roja
    # oreja
    r(20 + hx, 15 + hy, 21 + hx, 18 + hy, 'f'); p(20 + hx, 16 + hy, 'F'); p(21 + hx, 17 + hy, 'F')
    # cejas
    r(24 + hx, 13 + hy, 27 + hx, 13 + hy, 'j'); r(30 + hx, 13 + hy, 33 + hx, 13 + hy, 'j')
    # lentes redondos (montura gris oscuro) con patilla hasta la oreja
    for (x0, x1) in ((23, 28), (29, 34)):
        for x in range(x0, x1 + 1):
            p(x + hx, 14 + hy, 'h'); p(x + hx, 18 + hy, 'h')
        for y in range(15, 18):
            p(x0 + hx, y + hy, 'h'); p(x1 + hx, y + hy, 'h')
    r(21 + hx, 15 + hy, 22 + hx, 15 + hy, 'h')
    # ojos
    if estado == 'agotado':
        r(25 + hx, 17 + hy, 26 + hx, 17 + hy, 'F'); r(31 + hx, 17 + hy, 32 + hx, 17 + hy, 'F')
    elif estado == 'cansado':
        r(25 + hx, 16 + hy, 26 + hx, 16 + hy, 'F'); r(31 + hx, 16 + hy, 32 + hx, 16 + hy, 'F')
        r(25 + hx, 17 + hy, 26 + hx, 17 + hy, 'n'); r(31 + hx, 17 + hy, 32 + hx, 17 + hy, 'n')
    else:
        r(25 + hx, 16 + hy, 26 + hx, 17 + hy, 'n'); r(31 + hx, 16 + hy, 32 + hx, 17 + hy, 'n')
        p(25 + hx, 16 + hy, 'w'); p(31 + hx, 16 + hy, 'w')
    r(32 + hx, 19 + hy, 33 + hx, 20 + hy, 'F')                         # nariz
    # barba: bigote y mandíbula, con canas
    r(27 + hx, 21 + hy, 35 + hx, 21 + hy, 'J')
    for y in range(22, 28):
        x0 = 20 + (y - 22) // 2; x1 = 36 - (y - 22) // 2
        r(x0 + hx, y + hy, x1 + hx, y + hy, 'J')
    r(22 + hx, 26 + hy, 34 + hx, 27 + hy, 'j')
    r(21 + hx, 19 + hy, 22 + hx, 22 + hy, 'J')                         # patilla
    for (x, y) in [(24, 23), (30, 25), (34, 22), (27, 26), (22, 24), (32, 24), (26, 22)]: p(x + hx, y + hy, 'M')
    if estado == 'energia':
        r(28 + hx, 23 + hy, 33 + hx, 23 + hy, 'w'); r(29 + hx, 24 + hy, 32 + hx, 24 + hy, 'R')
    elif estado == 'agotado':
        r(30 + hx, 23 + hy, 31 + hx, 23 + hy, 'R')
    else:
        r(29 + hx, 23 + hy, 32 + hx, 23 + hy, 'R')
    contorno(g)
    # gotas de sudor (sin contorno)
    if estado in ('cansado', 'agotado'):
        p(38 + hx, 9 + hy, 'c'); p(38 + hx, 10 + hy, 'C'); p(39 + hx, 10 + hy, 'c')
    if estado == 'agotado':
        p(17 + hx, 21 + hy, 'c'); p(17 + hx, 22 + hy, 'C')
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
