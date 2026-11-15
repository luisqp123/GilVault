# Personaje del usuario en vista 3/4, estilo retro de paleta reducida y
# contorno marrón. Pelo recogido en moño, barba, lentes, camiseta azul verdosa, pantalón gris,
# botas, mochila de cuero con esterilla y bastón. 4 estados x 2 cuadros + íconos de equipo.
import json

def lienzo(w, h): return [['.'] * w for _ in range(h)]

def contorno(g, c='D'):
    H, W = len(g), len(g[0])
    m = [[g[y][x] != '.' for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.' and any(0 <= x+dx < W and 0 <= y+dy < H and m[y+dy][x+dx]
                                      for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                g[y][x] = c

def heroe(estado='normal', respira=False):
    W, H = 40, 58
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

    dy = {'energia': -1, 'normal': 0, 'cansado': 1, 'agotado': 3}[estado] + (1 if respira else 0)

    # ---------- Mochila (asoma detrás del hombro derecho, vista 3/4) ----------
    by = 21 + dy
    r(24, by, 31, by + 15, 'b'); r(29, by, 31, by + 15, 'n')
    r(26, by + 2, 28, by + 3, 'g')                                       # hebilla
    r(25, by + 8, 30, by + 12, 'n'); r(26, by + 9, 29, by + 11, 'b')    # bolsillo
    r(22, by - 4, 32, by - 1, 'E'); r(22, by - 4, 32, by - 4, 'e')      # esterilla enrollada
    for x in (24, 29): r(x, by - 4, x, by - 1, 'n')

    # ---------- Torso 3/4: camiseta azul verdosa ----------
    ty = 22 + dy
    r(12, ty, 25, 39, 'U'); r(21, ty, 25, 39, 'W')
    r(15, ty, 21, ty, 'W')                                  # cuello
    r(13, ty, 14, 37, 'n'); r(22, ty, 23, 37, 'n')          # correas de la mochila
    r(13, ty + 7, 23, ty + 7, 'n'); p(18, ty + 7, 'g')      # correa de pecho
    r(12, 38, 25, 39, 'n'); p(18, 38, 'g')                  # cinturón
    r(26, ty + 2, 27, ty + 9, 'W')                          # brazo lejano

    # ---------- Brazo cercano y bastón ----------
    caida = 2 if estado == 'agotado' else 0
    r(9, ty + 1, 12, ty + 8 + caida, 'U'); r(9, ty + 1, 9, ty + 8 + caida, 'W')
    r(8, ty + 9 + caida, 11, ty + 11 + caida, 'K'); r(11, ty + 10 + caida, 11, ty + 11 + caida, 'N')
    r(6, 9, 7, 53, 'b'); r(7, 9, 7, 53, 'n')                # bastón
    r(5, 6, 8, 9, 'n'); r(6, 6, 7, 7, 'b')                  # pomo

    # ---------- Piernas 3/4 ----------
    r(13, 40, 18, 48, 'Y'); r(20, 40, 25, 48, 'Y')
    r(17, 40, 18, 48, 'd'); r(24, 40, 25, 48, 'd')
    r(12, 49, 18, 52, 'n'); r(19, 49, 25, 52, 'n')
    r(12, 49, 14, 50, 'b'); r(19, 49, 21, 50, 'b')
    r(11, 53, 18, 53, 'D'); r(19, 53, 26, 53, 'D')

    # ---------- Cabeza 3/4 (mira un poco a la izquierda) ----------
    hy = 2 + dy
    elipse(18, 12 + hy, 7.5, 8.5, 'K')
    r(22, 7 + hy, 25, 17 + hy, 'N')                         # lado en sombra
    elipse(19, 4 + hy, 8, 3.6, 'H')                         # pelo peinado hacia atrás
    r(23, 4 + hy, 27, 12 + hy, 'H')
    for (x, y) in [(14, 2), (19, 1), (24, 3), (26, 9)]: p(x, y + hy, 'I')
    elipse(27, 2 + hy, 2.6, 2.6, 'H'); p(26, 1 + hy, 'I')   # moño
    r(25, 4 + hy, 26, 4 + hy, 'r')                          # gomita roja
    r(24, 11 + hy, 25, 13 + hy, 'K'); p(25, 12 + hy, 'N')   # oreja
    # cejas
    r(12, 9 + hy, 14, 9 + hy, 'H'); r(18, 9 + hy, 21, 9 + hy, 'H')
    # lentes: dos cristales, puente y patilla
    for (x0, x1) in ((11, 15), (17, 22)):                   # montura fina: arriba y a los lados
        r(x0, 10 + hy, x1, 10 + hy, 'D')
        p(x0, 11 + hy, 'D'); p(x1, 11 + hy, 'D'); p(x0, 12 + hy, 'I'); p(x1, 12 + hy, 'I')
    p(16, 10 + hy, 'D'); r(23, 10 + hy, 24, 10 + hy, 'D')
    if estado == 'agotado':
        r(13, 12 + hy, 14, 12 + hy, 'D'); r(19, 12 + hy, 20, 12 + hy, 'D')
    elif estado == 'cansado':
        r(13, 12 + hy, 14, 12 + hy, 'D'); r(19, 12 + hy, 20, 12 + hy, 'D')
        r(13, 11 + hy, 14, 11 + hy, 'N'); r(19, 11 + hy, 20, 11 + hy, 'N')
    else:
        r(13, 11 + hy, 13, 12 + hy, 'D'); r(19, 11 + hy, 19, 12 + hy, 'D')
    p(15, 14 + hy, 'N'); p(16, 14 + hy, 'N')                # nariz
    # barba corta: bigote fino y mandíbula (las mejillas quedan a la vista)
    r(14, 15 + hy, 19, 15 + hy, 'H')
    for y in range(17, 21):
        x0 = 12 + max(0, y - 18); x1 = 23 - max(0, y - 18)
        r(x0, y + hy, x1, y + hy, 'H')
    r(12, 16 + hy, 13, 16 + hy, 'H'); r(21, 16 + hy, 23, 16 + hy, 'H')
    p(15, 19 + hy, 'I'); p(20, 18 + hy, 'I')
    if estado == 'energia':
        r(14, 17 + hy, 19, 17 + hy, 'w')
    elif estado != 'agotado':
        r(15, 17 + hy, 18, 17 + hy, 'N')
    else:
        r(16, 17 + hy, 17, 17 + hy, 'N')
    r(16, 21 + hy, 20, 21 + hy, 'N')                        # cuello
    contorno(g)
    if estado in ('cansado', 'agotado'):                    # sudor (sin contorno)
        p(28, 8 + hy, 'c'); p(28, 9 + hy, 'C')
    if estado == 'agotado':
        p(9, 4 + hy, 'c'); p(9, 5 + hy, 'C')
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
    contorno(g, 'k')
    return [''.join(f) for f in g]

frames = {}
for est in ('energia', 'normal', 'cansado', 'agotado'):
    frames[f'heroe_{est}_1'] = heroe(est)
    frames[f'heroe_{est}_2'] = heroe(est, respira=True)
for t in ('cabeza', 'cuerpo', 'mano', 'accesorio'):
    frames[f'equipo_{t}'] = icono(t)
print(json.dumps(frames, indent=1))
