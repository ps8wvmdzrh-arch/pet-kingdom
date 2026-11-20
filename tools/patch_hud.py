# -*- coding: utf-8 -*-
import io, os
BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8').read()
pairs = [
    ("panel(8, 8, VW - 16, 50, 0.82, 12);", "panel(8, 8, VW - 16, 62, 0.82, 12);"),
    ("text(ZONES[ST.zone].name + (ST.night ? ' · 夜' : ' · 昼'), 20, 22, 13.5,",
     "text(ZONES[ST.zone].name + (ST.night ? ' · 夜' : ' · 昼'), 20, 19, 13.5,"),
    ("text('图鉴 ' + seenCount() + '/' + TOTAL_SPECIES + ' · 捕获 ' + caughtCount(), 20, 40, 10,",
     "text('图鉴 ' + seenCount() + '/' + TOTAL_SPECIES + ' · 捕获 ' + caughtCount(), 20, 35, 9.5,"),
    ("if (lp) text(SPECIES[lp.id].name + ' Lv' + lp.lv + ' · ' + mountLabel(), 20, 44, 9.5,",
     "if (lp) text(SPECIES[lp.id].name + ' Lv' + lp.lv + ' · ' + mountLabel(), 20, 51, 9,"),
    ("panel(8, 60, VW - 16, 26, 0.7, 8);", "panel(8, 72, VW - 16, 26, 0.7, 8);"),
    ("text('目标：' + q, 18, 73, 10.5,", "text('目标：' + q, 18, 85, 10.5,")
]
ok = 0
for old, new in pairs:
    if s.count(old) == 1:
        s = s.replace(old, new, 1); ok += 1
    else:
        print('MISS:', old[:40], s.count(old))
io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
print('applied', ok, '/', len(pairs))
