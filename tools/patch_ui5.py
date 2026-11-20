# -*- coding: utf-8 -*-
import io, os
BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8', newline='').read().replace('\r\n', '\n')
rep = []

pairs = [
    ("panel(10, 430, VW - 20, 204, 0.95, 12);",
     "panel(10, 430, VW - 20, 50 + Math.min(5, mvs.length) * 33, 0.95, 12);"),
    ("text('五系相克 · 捕捉养成 · 虹光王国', VW / 2, 148, 12, 'rgba(255,255,255,0.85)', 'center', '500');",
     "text(TOTAL_SPECIES + ' 种宠物 · 五系相克 · 图鉴 / 天赋进化 / 秘传 / 坐骑', VW / 2, 148, 11.5, 'rgba(255,255,255,0.85)', 'center', '500');")
]
for old, new in pairs:
    if s.count(old) == 1:
        s = s.replace(old, new, 1); rep.append('ok ' + old[:28])
    else:
        rep.append('FAIL ' + old[:28] + ' n=' + str(s.count(old)))

io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
print('\n'.join(rep))
