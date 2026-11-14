# Genera los cuadros de animación del Sabio Ábaco (personaje original de GilVault)
# y de la moneda giratoria. Imprime un objeto JS con las cuadrículas.
import json

def lienzo(w, h): return [['.'] * w for _ in range(h)]

def contorno(g, excluir=()):
    H, W = len(g), len(g[0])
    m = [[g[y][x] != '.' and (x, y) not in excluir for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.' and any(0 <= x+dx < W and 0 <= y+dy < H and m[y+dy][x+dx]
                                      for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                g[y][x] = 'k'

def sabio(dy=0, parpadeo=False, habla=False, brillo=False):
    W, H = 26, 32
    g = lienzo(W, H)
    def p(x, y, c):
        if 0 <= x < W and 0 <= y < H: g[y][x] = c
    def r(x0, y0, x1, y1, c):
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): p(x, y, c)
    # Bastón (fijo, no se mueve con el cuerpo)
    r(21, 7, 21, 30, 'n'); r(22, 8, 22, 30, 'b')
    # Orbe
    orb = [(20,3),(21,3),(22,3),(19,4),(20,4),(21,4),(22,4),(23,4),(19,5),(20,5),(21,5),(22,5),(23,5),(20,6),(21,6),(22,6)]
    for (x, y) in orb: p(x, y, 'C')
    for (x, y) in [(20,4),(21,4),(20,5)]: p(x, y, 'c')
    p(20, 4, 'w' if brillo else 'c'); p(21, 5, 'c' if brillo else 'C')
    # Túnica (la parte baja no se mueve; la alta sigue al cuerpo)
    for i, y in enumerate(range(18 + dy, 30)):
        x0 = 8 - (y - 18) // 3; x1 = 17 + (y - 18) // 3
        r(x0, y, x1, y, 't'); r(x1 - 1, y, x1, y, 'T')
    r(6, 29, 19, 29, 'T')
    r(8, 22 + dy, 17, 22 + dy, 'g'); p(12, 22 + dy, 'y')   # cinturón
    # Manos
    r(19, 18 + dy, 20, 19 + dy, 'e'); p(20, 19 + dy, 'E')   # mano en el bastón
    r(5, 23 + dy, 6, 24 + dy, 'e')
    # Botas
    r(7, 30, 9, 30, 'n'); r(15, 30, 17, 30, 'n')
    # Barba (encima de la túnica)
    for y in range(14 + dy, 26 + dy):
        k = (y - 14 - dy)
        x0 = 8 + k // 3; x1 = 17 - k // 3
        if x0 <= x1: r(x0, y, x1, y, 'w'); p(x1, y, 's')
    # Cara
    r(9, 11 + dy, 16, 14 + dy, 'e'); r(15, 11 + dy, 16, 14 + dy, 'E')
    ojos = 'E' if parpadeo else 'k'
    p(10, 13 + dy, ojos); p(14, 13 + dy, ojos)
    r(9, 12 + dy, 11, 12 + dy, 'w'); r(13, 12 + dy, 15, 12 + dy, 'w')  # cejas
    p(12, 14 + dy, 'E')  # nariz
    r(9, 15 + dy, 16, 15 + dy, 'w')  # bigote
    if habla: r(11, 16 + dy, 13, 16 + dy, 'R'); p(12, 17 + dy, 'R')
    # Sombrero: ala + cono con punta doblada
    r(4, 10 + dy, 20, 10 + dy, 'P'); r(5, 9 + dy, 19, 9 + dy, 'p')
    cono = [(7, 18), (8, 17), (8, 16), (9, 15), (9, 15), (10, 14), (10, 13), (11, 13)]
    for i, (a, b) in enumerate(cono):
        y = 8 - i + dy
        r(a, y, b, y, 'p'); p(b, y, 'P')
    r(7, 8 + dy, 18, 8 + dy, 'g')  # banda dorada
    r(9, 1 + dy, 10, 1 + dy, 'p'); r(7, 0 + dy, 8, 0 + dy, 'p')  # punta doblada
    for (x, y) in [(11, 5), (14, 7), (10, 3)]: p(x, y + dy, 'y')  # estrellas
    contorno(g)
    # Líneas internas
    for x in range(9, 17):
        if g[11 + dy][x] == 'e' or g[11 + dy][x] == 'E': g[11 + dy][x] = 'k'  # sombra del ala
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
