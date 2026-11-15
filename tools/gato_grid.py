# Genera los cuadros de animación de Maese Ronroneo (personaje original de GilVault):
# gato atigrado que lee el tarot en una mesa con vela. Imprime un objeto JS.
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

def gato(llama=0, ojos='cerrados', carta=False, dy=0):
    W, H = 34, 32
    g = lienzo(W, H)
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): p(x, y, c)
    # --- Cuerpo (detrás de la mesa) ---
    for y in range(13 + dy, 24):
        k = (y - 13 - dy)
        x0 = 7 - min(k, 4) // 2; x1 = 20 + min(k, 4) // 2
        r(x0, y, x1, y, 'm'); r(x1 - 2, y, x1, y, 'M')
    r(11, 15 + dy, 16, 23, 'w')  # pecho blanco
    for y in (16 + dy, 19 + dy):  # rayas del lomo
        r(6, y, 8, y, 'h'); r(19, y, 21, y, 'h')
    # --- Cabeza ---
    hy = 3 + dy
    r(8, hy + 2, 19, hy + 10, 'm'); r(7, hy + 4, 20, hy + 8, 'm')
    r(17, hy + 2, 19, hy + 10, 'M'); r(20, hy + 4, 20, hy + 8, 'M')
    # orejas
    for i in range(3):
        r(8, hy - 1 + i, 9 + i, hy - 1 + i, 'm'); r(18 - i, hy - 1 + i, 19, hy - 1 + i, 'M')
    p(9, hy + 1, 'q'); p(18, hy + 1, 'q')
    # rayas de la frente y mejillas
    for (x, y) in [(12, 2), (13, 2), (14, 2), (15, 2), (13, 3), (14, 3), (12, 4), (15, 4)]: p(x, hy + y, 'h')
    for (x, y) in [(7, 6), (8, 7), (20, 6), (19, 7)]: p(x, hy + y, 'h')
    # hocico blanco
    r(11, hy + 7, 16, hy + 9, 'w')
    p(13, hy + 7, 'q'); p(14, hy + 7, 'q')  # nariz
    p(12, hy + 8, 'k'); p(15, hy + 8, 'k')   # boca
    if ojos == 'abiertos':
        r(9, hy + 4, 11, hy + 5, 'v'); r(16, hy + 4, 18, hy + 5, 'v')
        r(10, hy + 4, 10, hy + 5, 'k'); r(17, hy + 4, 17, hy + 5, 'k')  # pupilas rasgadas
        p(9, hy + 4, 'w'); p(16, hy + 4, 'w')  # brillo
        r(13, hy + 9, 14, hy + 9, 'R')  # boca abierta (habla)
    else:  # ojos cerrados, plácidos
        r(9, hy + 5, 11, hy + 5, 'k'); r(16, hy + 5, 18, hy + 5, 'k')
    # bigotes
    for (x0, x1, y) in [(4, 6, 7), (4, 6, 9), (21, 23, 7), (21, 23, 9)]: r(x0, hy + y, x1, hy + y, 's')
    # --- Mesa con mantel ---
    r(0, 24, 33, 31, 'x'); r(0, 24, 33, 24, 'p'); r(0, 30, 33, 31, 'X')
    for x in range(1, 33, 4): p(x, 27, 'X')  # flecos del mantel
    # cartas sobre la mesa
    for i, cx in enumerate((3, 9, 15)):
        r(cx, 25, cx + 3, 28, 'e'); r(cx + 1, 26, cx + 2, 27, ['r', 'C', 'v'][i])
    # patas sobre la mesa
    r(8, 23, 10, 24, 'w'); r(17, 23, 19, 24, 'w')
    # --- Carta levantada en la pata ---
    if carta:
        r(18, 13 + dy, 20, 15 + dy, 'w')  # pata alzada
        r(19, 8 + dy, 23, 13 + dy, 'e'); r(20, 9 + dy, 22, 12 + dy, 'g'); p(21, 10 + dy, 'R'); p(21, 11 + dy, 'R')
        r(17, 23, 19, 24, 'x')  # esa pata ya no está sobre la mesa
    # --- Vela con llama que parpadea ---
    r(27, 16, 29, 23, 'e'); r(29, 16, 29, 23, 'E'); r(26, 23, 30, 23, 'O')
    p(28, 15, 'k')  # mecha
    llamas = [
        [(28, 14, 'o'), (28, 13, 'y'), (28, 12, 'y'), (27, 13, 'o'), (29, 13, 'o'), (28, 11, 'g')],
        [(28, 14, 'o'), (28, 13, 'y'), (29, 12, 'y'), (27, 13, 'o'), (29, 13, 'o'), (29, 11, 'g'), (28, 12, 'g')],
        [(28, 14, 'o'), (28, 13, 'y'), (28, 12, 'y'), (27, 12, 'g'), (27, 13, 'o'), (29, 13, 'o')],
    ][llama]
    for (x, y, c) in llamas: p(x, y, c)
    contorno(g)
    return [''.join(f) for f in g]

frames = {
    'gato_1': gato(llama=0),
    'gato_2': gato(llama=1, dy=0),
    'gato_3': gato(llama=2),
    'gato_habla_1': gato(llama=0, ojos='abiertos'),
    'gato_habla_2': gato(llama=1, ojos='cerrados'),
    'gato_carta': gato(llama=2, ojos='abiertos', carta=True),
}
print(json.dumps(frames, indent=1))
