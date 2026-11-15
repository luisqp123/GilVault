# Genera los íconos de las ranuras de equipo (cabeza, cuerpo, mano, accesorio).
# El personaje animado viene de arte/adventurero_sprite_sheet.svg (ver tools/extraer_heroe.py).
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
for t in ('cabeza', 'cuerpo', 'mano', 'accesorio'):
    frames[f'equipo_{t}'] = icono(t)
print(json.dumps(frames, indent=1))
