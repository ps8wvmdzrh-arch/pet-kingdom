# -*- coding: utf-8 -*-
import io, os, re
BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
raw = io.open(G, 'rb').read()
print('bytes', len(raw), 'CRLF', raw.count(b'\r\n'))
s = raw.decode('utf-8')
print('swapLead count', s.count('swapLead'), 'var t count', s.count('var t'))
for m in re.finditer('swapLead', s):
    i = m.start()
    print(i, ascii(s[i - 30:i + 120]))
