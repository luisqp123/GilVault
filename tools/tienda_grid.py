# Genera la escena de la tienda mágica detrás de Maese Ronroneo (original de GilVault),
# más el sol y la luna que se ven por la ventana. '.' = transparente (el cielo se ve detrás).
import json

W, H = 56, 88   # escena alta: letrero arriba, ventana grande, gato y mostrador abajo

def lienzo(w, h, c='.'): return [[c] * w for _ in range(h)]

def escena():
    g = lienzo(W, H, 'z')  # pared
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): p(x, y, c)
    # Ladrillos de la pared
    for y in range(0, H, 4):
        for x in range((y // 4 % 2) * 3, W, 6): r(x, y, x + 4, y, 'Z')
    # --- Ventana en arco alta (centro) ---
    cx, top, bot, rad = 27.5, 12, 58, 10
    for y in range(top, bot + 1):
        for x in range(17, 39):
            dentro = abs(x - cx) <= rad and (y >= top + rad or (x - cx) ** 2 + (y - (top + rad)) ** 2 <= rad ** 2)
            if dentro: p(x, y, '.')
    marco = []
    for y in range(H):
        for x in range(W):
            if g[y][x] != '.' and any(0 <= x+dx < W and 0 <= y+dy < H and g[y+dy][x+dx] == '.'
                                      for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                marco.append((x, y))
    for (x, y) in marco: p(x, y, 'u')
    for (x, y) in marco:  # segunda línea del marco, más oscura, por fuera
        for dx, dy in ((1,0),(-1,0),(0,-1)):
            if g[y+dy][x+dx] in 'zZ': p(x+dx, y+dy, 'A')
    for y in range(top + 1, bot + 1):  # parteluces
        if g[y][27] == '.': p(27, y, 'a'); p(28, y, 'a')
    for yy in (27, 43):
        for x in range(17, 39):
            if g[yy][x] == '.': p(x, yy, 'a')
    r(15, bot + 1, 40, bot + 2, 'u'); r(15, bot + 2, 40, bot + 2, 'A')  # alféizar
    r(33, bot - 2, 36, bot, 'O'); r(33, bot - 3, 36, bot - 3, 'v'); p(34, bot - 4, 'V'); p(35, bot - 5, 'v')
    # --- Estanterías a los lados ---
    estantes = (22, 36, 50, 64, 78)
    for (x0, x1) in ((0, 13), (42, 55)):
        for y in estantes:
            r(x0, y, x1, y, 'u'); r(x0, y + 1, x1, y + 1, 'A')
        r(x0 if x0 else x1, 8, x0 if x0 else x1, 79, 'A')
    def botella(x, y, liquido, alta=4):
        r(x, y - alta + 1, x + 2, y, liquido); p(x, y - alta + 1, 'w')
        p(x + 1, y - alta, 'e'); p(x + 1, y - alta - 1, 'n')
    def frasco(x, y, c):
        r(x, y - 3, x + 3, y, c); r(x, y - 4, x + 3, y - 4, 'n'); p(x + 1, y - 2, 'w')
    def libro(x, y, c, alto=6):
        r(x, y - alto + 1, x + 1, y, c); p(x, y - alto + 2, 'y')
    izq = [
        [(botella, 1, 'p', 4), (botella, 5, 'v', 5), (frasco, 9, 'C')],
        [(libro, 1, 'r', 6), (libro, 3, 'C', 6), (libro, 5, 'g', 5), (botella, 9, 'r', 4)],
        [(frasco, 1, 'O'), (botella, 6, 'c', 5), (botella, 10, 'p', 3)],
        [(botella, 1, 'v', 4), (frasco, 5, 'r'), (libro, 10, 'p', 6)],
        [(libro, 1, 'g', 5), (libro, 3, 'r', 6), (botella, 6, 'C', 4), (frasco, 10, 'v')],
    ]
    der = [
        [(frasco, 43, 'v'), (botella, 48, 'r', 5), (botella, 52, 'c', 4)],
        [(botella, 43, 'g', 4), (libro, 47, 'v', 6), (libro, 49, 'r', 5), (libro, 51, 'C', 6)],
        [(botella, 43, 'p', 5), (frasco, 47, 'g'), (botella, 52, 'v', 3)],
        [(frasco, 43, 'C'), (botella, 48, 'O', 4), (botella, 52, 'r', 5)],
        [(botella, 43, 'c', 4), (libro, 47, 'O', 6), (libro, 49, 'v', 5), (frasco, 52, 'p')],
    ]
    for fila, y in zip(izq, estantes):
        for f, x, *args in fila: f(x, y - 1, *args)
    for fila, y in zip(der, estantes):
        for f, x, *args in fila: f(x, y - 1, *args)
    # hiedra que cuelga del techo
    for (x, largo) in ((3, 9), (7, 5), (12, 12), (44, 10), (49, 6), (53, 13)):
        for i in range(largo):
            p(x + (i % 2), i, 'v' if i % 3 else 'V')
    # --- Mostrador inferior (sigue la mesa del gato) ---
    r(0, 80, 55, 87, 'x'); r(0, 80, 55, 80, 'p'); r(0, 86, 55, 87, 'X')
    return [''.join(f) for f in g]

def astro(tipo):
    g = lienzo(8, 8)
    for y in range(8):
        for x in range(8):
            if (x - 3.5) ** 2 + (y - 3.5) ** 2 <= 12.5: g[y][x] = 'y' if tipo == 'sol' else 'm'
    if tipo == 'sol':
        for (x, y) in [(2, 2), (3, 2), (2, 3)]: g[y][x] = 'w'
        for y in range(8):
            for x in range(8):
                if g[y][x] == 'y' and (x - 3.5) ** 2 + (y - 3.5) ** 2 > 7: g[y][x] = 'g'
    else:  # luna creciente: se recorta un círculo desplazado
        for y in range(8):
            for x in range(8):
                if (x - 5.5) ** 2 + (y - 2.5) ** 2 <= 9: g[y][x] = '.'
        for (x, y) in [(2, 5), (3, 6)]:
            if g[y][x] == 'm': g[y][x] = 's'
    return [''.join(f) for f in g]

def pocion(liquido, forma):
    """Pocioncita de adorno para los estantes del menú (8x10)."""
    g = lienzo(8, 10)
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): g[y][x] = c
    if forma == 'redonda':
        for y in range(3, 10):
            for x in range(8):
                if (x - 3.5) ** 2 + (y - 6.5) ** 2 <= 10: g[y][x] = liquido
        r(3, 1, 4, 2, 'e'); r(3, 0, 4, 0, 'n')
    elif forma == 'alta':
        r(2, 2, 5, 9, liquido); r(3, 1, 4, 1, 'e'); r(3, 0, 4, 0, 'n')
    else:  # frasco
        r(1, 3, 6, 9, liquido); r(1, 2, 6, 2, 'n')
    g[4][2] = 'w'
    contorno_g = [f[:] for f in g]
    for y in range(10):
        for x in range(8):
            if g[y][x] == '.' and any(0 <= x+dx < 8 and 0 <= y+dy < 10 and contorno_g[y+dy][x+dx] != '.'
                                      for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                g[y][x] = 'k'
    return [''.join(f) for f in g]

def ladrillo():
    """Baldosa de pared que se repite de fondo (12x8)."""
    g = lienzo(12, 8, 'z')
    for x in range(12): g[0][x] = 'Z'; g[4][x] = 'Z'
    g[1][0] = g[2][0] = g[3][0] = 'Z'; g[5][6] = g[6][6] = g[7][6] = 'Z'
    return [''.join(f) for f in g]

print(json.dumps({'tienda': escena(), 'sol': astro('sol'), 'luna': astro('luna'),
                  'pocion_1': pocion('p', 'redonda'), 'pocion_2': pocion('v', 'alta'),
                  'pocion_3': pocion('C', 'frasco'), 'pocion_4': pocion('r', 'redonda'),
                  'pocion_5': pocion('g', 'alta'), 'ladrillo': ladrillo()}, indent=1))
