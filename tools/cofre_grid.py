# Genera la cuadrícula 32x32 del cofre (ícono) y la imprime como array JS.
W = H = 32
g = [['.'] * W for _ in range(H)]
def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: g[y][x] = c
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)

# Tapa abierta (detrás)
rect(5, 3, 26, 10, 'b'); rect(5, 3, 26, 4, 'l'); rect(5, 9, 26, 10, 'n')
for x0 in (5, 25): rect(x0, 5, x0 + 1, 8, 'm'); put(x0 + 1, 8, 'M')
# Interior oscuro
rect(5, 11, 26, 12, 'O')
# Montaña de monedas (elipse)
cx, cy, rx, ry = 15.5, 13, 12.5, 6.5
for y in range(4, 14):
    for x in range(W):
        if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 and y <= 13:
            put(x, y, 'g')
for y in range(4, 14):
    for x in range(W):
        if g[y][x] == 'g' and ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 0.55 and x > cx: put(x, y, 'o')
# Brillos y bordes de monedas
for (x, y) in [(9, 9), (14, 8), (20, 9), (12, 11), (17, 11), (23, 11), (7, 12), (16, 7)]:
    put(x, y, 'y'); put(x + 1, y, 'y'); put(x, y + 1, 'k'); put(x + 1, y + 1, 'O')
# Cuerpo del cofre
rect(3, 14, 28, 27, 'b'); rect(3, 14, 28, 15, 'l'); rect(3, 21, 28, 21, 'n'); rect(3, 27, 28, 27, 'n')
for x0 in (3, 27):
    for y0 in (16, 23): rect(x0, y0, x0 + 1, y0 + 2, 'm'); put(x0 + 1, y0 + 2, 'M')
# Cerradura
rect(13, 17, 18, 22, 'g'); rect(13, 17, 18, 17, 'y'); rect(17, 18, 18, 22, 'o')
put(15, 19, 'k'); put(16, 19, 'k'); put(15, 20, 'k'); put(16, 20, 'k'); put(15, 21, 'k')
# Monedas sueltas delante
for (x, y) in [(5, 28), (24, 28), (9, 29)]:
    rect(x, y, x + 2, y + 1, 'g'); put(x, y, 'y'); put(x + 2, y + 1, 'o')
# Contorno
mask = [[g[y][x] != '.' for x in range(W)] for y in range(H)]
for y in range(H):
    for x in range(W):
        if not mask[y][x] and any(0 <= x + dx < W and 0 <= y + dy < H and mask[y + dy][x + dx]
                                  for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            g[y][x] = 'k'
# Separación pila / cuerpo y borde de la tapa
for x in range(3, 29): g[13][x] = 'k'
for x in range(5, 27):
    if g[2][x] != '.': g[2][x] = 'k'
# Destellos
for (x, y) in [(2, 5), (29, 9)]:
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): put(x + dx, y + dy, 'w')
print(',\n'.join("      '%s'" % ''.join(r) for r in g))
