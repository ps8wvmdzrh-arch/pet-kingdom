# -*- coding: utf-8 -*-
import io, os, re
BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8', newline='').read()
s = s.replace('\r\n', '\n')

pat = re.compile(r"  function swapLead\(idx\) \{.*?\n  \}", re.S)
m = pat.search(s)
print('found', bool(m))
if m:
    new = ("  function swapLead(idx) {\n"
           "    if (idx <= 0 || idx >= ST.party.length) return;\n"
           "    var chosen = ST.party.splice(idx, 1)[0];\n"
           "    ST.party.unshift(chosen);\n"
           "    toast('首发换成了 ' + SPECIES[chosen.id].name);\n"
           "  }")
    s = s[:m.start()] + new + s[m.end():]
    print('patched swapLead')

io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
