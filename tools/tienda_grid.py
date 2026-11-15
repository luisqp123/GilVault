# Genera la escena de la tienda mágica detrás de Maese Ronroneo (original de GilVault),
# más el sol y la luna que se ven por la ventana. '.' = transparente (el cielo se ve detrás).
import json

W, H = 56, 60

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
    # --- Ventana en arco (centro) ---
    cx, top, bot, rad = 27.5, 3, 31, 10
    for y in range(top, bot + 1):
        for x in range(17, 39):
            dentro = abs(x - cx) <= rad and (y >= top + rad or (x - cx) ** 2 + (y - (top + rad)) ** 2 <= rad ** 2)
            if dentro: p(x, y, '.')
    # marco: contorno de la zona transparente
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
    # parteluces (cruz de la ventana)
    for y in range(top + 1, bot + 1):
        if g[y][27] == '.': p(27, y, 'a'); p(28, y, 'a')
    for x in range(17, 39):
        if g[18][x] == '.': p(x, 18, 'a')
    r(15, bot + 1, 40, bot + 2, 'u'); r(15, bot + 2, 40, bot + 2, 'A')  # alféizar
    # macetita en el alféizar
    r(33, bot - 2, 36, bot, 'O'); r(33, bot - 3, 36, bot - 3, 'v'); p(34, bot - 4, 'V'); p(35, bot - 5, 'v')
    # --- Estanterías izquierda y derecha ---
    for (x0, x1) in ((0, 13), (42, 55)):
        for y in (13, 25, 37, 49):
            r(x0, y, x1, y, 'u'); r(x0, y + 1, x1, y + 1, 'A')
        r(x0 if x0 else x1, 0, x0 if x0 else x1, 50, 'A')
    def botella(x, y, liquido, alta=4):  # y = base (encima del estante)
        r(x, y - alta + 1, x + 2, y, liquido); p(x, y - alta + 1, 'w')
        p(x + 1, y - alta, 'e'); p(x + 1, y - alta - 1, 'n')
    def frasco(x, y, c):
        r(x, y - 3, x + 3, y, c); r(x, y - 4, x + 3, y - 4, 'n'); p(x + 1, y - 2, 'w')
    def libro(x, y, c, alto=6):
        r(x, y - alto + 1, x + 1, y, c); p(x, y - alto + 2, 'y')
    # izquierda
    botella(1, 12, 'p'); botella(5, 12, 'v', 5); frasco(9, 12, 'C')
    libro(1, 24, 'r'); libro(3, 24, 'C'); libro(5, 24, 'g', 5); botella(9, 24, 'r')
    frasco(1, 36, 'O'); botella(6, 36, 'c', 5); botella(10, 36, 'p', 3)
    botella(1, 48, 'v'); frasco(5, 48, 'r'); libro(10, 48, 'p')
    # derecha
    frasco(43, 12, 'v'); botella(48, 12, 'r', 5); botella(52, 12, 'c')
    botella(43, 24, 'g'); libro(47, 24, 'v'); libro(49, 24, 'r', 5); libro(51, 24, 'C')
    botella(43, 36, 'p', 5); frasco(47, 36, 'g'); botella(52, 36, 'v', 3)
    frasco(43, 48, 'C'); botella(48, 48, 'O'); botella(52, 48, 'r', 5)
    # hiedra que cuelga del techo
    for (x, largo) in ((3, 6), (7, 3), (12, 8), (44, 7), (49, 4), (53, 9)):
        for i in range(largo):
            p(x + (i % 2), i, 'v' if i % 3 else 'V')
    # --- Mostrador inferior (sigue la mesa del gato) ---
    r(0, 52, 55, 59, 'x'); r(0, 52, 55, 52, 'p'); r(0, 58, 55, 59, 'X')
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
