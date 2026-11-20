# -*- coding: utf-8 -*-
import io, os
BASE = os.path.dirname(os.path.abspath(__file__))
T = os.path.join(BASE, 'smoke.js')
s = io.open(T, encoding='utf-8').read()
s = s.replace("const zz = R.ZONES[z], map = R.ZMAPS[z];",
              "const zz = R.ZONES[z]; R.getZone(z); const map = R.ZMAPS[z];")
s = s.replace("const forestMap = R.ZMAPS.forest;",
              "R.getZone('forest'); const forestMap = R.ZMAPS.forest;")
io.open(T, 'w', encoding='utf-8', newline='\n').write(s)
print('patched test')
