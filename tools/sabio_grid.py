# Genera los cuadros de animación del Sabio Ábaco (personaje original de GilVault)
# y de la moneda giratoria. Imprime un objeto JS con las cuadrículas.
# Diseño: mago chibi con sombrero azul caído (punta enrollada), barba blanca y pergamino.
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

def sabio(dy=0, parpadeo=False, habla=False, brillo=False):
    W, H = 28, 32
    g = lienzo(W, H)
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): p(x, y, c)
    # --- Túnica (base fija; la parte alta sigue la respiración) ---
    for y in range(19 + dy, 29):
        x0 = 8 - (y - 19) // 4; x1 = 19 + (y - 19) // 4
        r(x0, y, x1, y, 'a'); r(x1 - 2, y, x1, y, 'A'); p(x0, y, 'u')
    r(7, 29, 9, 29, 'n'); r(17, 29, 19, 29, 'n')  # zapatos
    # --- Barba (cae sobre la túnica) ---
    for y in range(16 + dy, 26 + dy):
        k = y - 16 - dy
        x0 = 8 + k // 2; x1 = 18 - k // 2
        if x0 <= x1: r(x0, y, x1, y, 'w'); p(x1, y, 's')
    # --- Pergamino en las manos (delante de la barba) ---
    sy = 20 + dy
    r(13, sy, 23, sy + 5, 'e'); r(13, sy, 23, sy, 'E'); r(13, sy + 5, 23, sy + 5, 'E')
    for i, yy in enumerate((sy + 2, sy + 3, sy + 4)):
        r(15, yy, 21 - (i % 2) * 2, yy, 'l')  # renglones de cuentas
    r(20, sy + 1, 21, sy + 1, 'y' if brillo else 'g')  # sello dorado que destella
    r(12, sy + 2, 13, sy + 3, 'e'); r(23, sy + 2, 24, sy + 3, 'e')  # manos
    # --- Cara ---
    r(9, 13 + dy, 17, 16 + dy, 'e'); r(16, 13 + dy, 17, 16 + dy, 'E')
    ojo = 'E' if parpadeo else 'k'
    p(11, 15 + dy, ojo); p(15, 15 + dy, ojo)
    r(10, 14 + dy, 12, 14 + dy, 'w'); r(14, 14 + dy, 16, 14 + dy, 'w')  # cejas
    p(13, 16 + dy, 'E')  # nariz
    r(10, 17 + dy, 16, 17 + dy, 'w')  # bigote
    if habla: r(12, 18 + dy, 14, 18 + dy, 'R')
    r(8, 13 + dy, 8, 17 + dy, 'w'); r(18, 13 + dy, 18, 16 + dy, 's')  # pelo a los lados
    # --- Sombrero: ala ancha caída, copa inclinada y punta enrollada ---
    r(5, 12 + dy, 22, 12 + dy, 'A'); r(6, 11 + dy, 21, 11 + dy, 'a'); r(20, 13 + dy, 22, 13 + dy, 'A')
    copa = [(7, 19), (8, 19), (8, 18), (8, 17), (7, 16), (6, 15), (5, 13), (4, 11)]
    for i, (a, b) in enumerate(copa):
        y = 10 - i + dy
        r(a, y, b, y, 'a'); p(b, y, 'A'); p(a, y, 'u')
    # punta enrollada hacia la izquierda
    for (x, y) in [(3, 3), (2, 3), (1, 4), (1, 5), (2, 6), (3, 6), (4, 5)]:
        p(x, y + dy, 'a')
    p(2, 4 + dy, 'A')
    for (x, y) in [(10, 8), (15, 6), (8, 4), (13, 9)]: p(x, y + dy, 'y')  # estrellas
    p(16, 6 + dy, 'g'); p(15, 5 + dy, 'g')
    contorno(g)
    for x in range(9, 18):  # sombra del ala sobre la frente
        if g[13 + dy][x] in 'eE': g[13 + dy][x] = 'k'
    return [''.join(f) for f in g]

def moneda(ancho):
    W = H = 12
    g = lienzo(W, H)
    cx = 5.5
    for y in range(1, 11):
        for x in range(W):
            rx = max(ancho / 2, 0.6)
            if ((x - cx) / rx) ** 2 + ((y - 5.5) / 5) ** 2 <= 1: g[y][x] = 'g'
    for y in range(H):
        for x in range(W):
            if g[y][x] == 'g' and x > cx: g[y][x] = 'o'
            if g[y][x] == 'g' and x < cx - ancho / 4: g[y][x] = 'y'
    if ancho >= 8:
        for (x, y) in [(5,3),(6,3),(4,4),(4,5),(4,6),(5,7),(6,7),(7,6),(6,6)]: g[y][x] = 'O'
    contorno(g)
    return [''.join(f) for f in g]

frames = {
    'sabio_1': sabio(),
    'sabio_2': sabio(dy=1, brillo=True),
    'sabio_parpadeo': sabio(parpadeo=True),
    'sabio_habla_1': sabio(habla=True),
    'sabio_habla_2': sabio(dy=1, brillo=True),
    'gil_1': moneda(10), 'gil_2': moneda(6), 'gil_3': moneda(2), 'gil_4': moneda(6),
}
print(json.dumps(frames, indent=1))
