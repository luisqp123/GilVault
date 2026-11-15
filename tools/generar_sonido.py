# Genera app/sonidos/objeto.ogg: fanfarria 8-bit ORIGINAL de "objeto obtenido" (onda cuadrada).
import math, struct, wave, subprocess, os
SR = 44100
def nota(f, dur, vol=0.22):
    n = int(SR * dur); out = []
    for i in range(n):
        t = i / SR
        sq = 1.0 if math.sin(2 * math.pi * f * t) >= 0 else -1.0   # onda cuadrada
        env = min(1.0, i / 200) * (1 - i / n) ** 0.6                # ataque corto, caída suave
        out.append(sq * vol * env)
    return out
N = {'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'A5': 880.0, 'C6': 1046.5, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98}
melodia = [('E5', .07), ('G5', .07), ('C6', .07), ('E6', .07), ('-', .05), ('D6', .09), ('E6', .09), ('G6', .42)]
muestras = []
for n, d in melodia:
    muestras += [0.0] * int(SR * d) if n == '-' else nota(N[n], d)
aqui = os.path.dirname(__file__)
wav = os.path.join(aqui, 'objeto.wav'); ogg = os.path.join(aqui, '..', 'app', 'sonidos', 'objeto.ogg')
with wave.open(wav, 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in muestras))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libvorbis', '-q:a', '4', ogg], check=True)
os.remove(wav)
print('Sonido generado:', os.path.abspath(ogg))
