# -*- coding: utf-8 -*-
import io, os
BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8').read()
rep = []

old_swap = """  function swapLead(idx) {
    if (idx <= 0 || idx >= ST.party.length) return;
    var t = ST.party; ST.party = ST.party[idx]; ST.party[idx] = t;
    toast('首发换成了 ' + SPECIES[ST.party.id].name);
  }"""
new_swap = """  function swapLead(idx) {
    if (idx <= 0 || idx >= ST.party.length) return;
    var chosen = ST.party.splice(idx, 1)[0];
    ST.party.unshift(chosen);
    toast('首发换成了 ' + SPECIES[chosen.id].name);
  }"""
if s.count(old_swap) == 1:
    s = s.replace(old_swap, new_swap, 1); rep.append('ok swapLead')
else:
    rep.append('FAIL swapLead ' + str(s.count(old_swap)))

anchor = "    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });\n  }\n\n  function swapLead(idx) {"
guide = """    var mlist = DEX_ORDER.filter(function (id) { return SPECIES[id].mount; });
    panel(18, 470, VW - 36, 88, 0.32, 10);
    text('可骑乘终体宠 ' + mlist.length + ' 种', 30, 488, 9.5, '#9fe8ff', 'left', '700');
    var groups = [['water', '涉水'], ['air', '飞行'], ['land', '疾驰']];
    groups.forEach(function (g, gi) {
      var names = mlist.filter(function (id) { return SPECIES[id].mount === g[0]; }).map(function (id) { return SPECIES[id].name; });
      if (!names.length) return;
      wrapText(g[1] + '：' + names.join('、'), VW - 70, 8.5).slice(0, 2).forEach(function (l, li) {
        text(l, 30, 504 + gi * 16 + li * 11, 8.5, 'rgba(255,255,255,0.72)', 'left', '600');
      });
    });
    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });
  }

  function swapLead(idx) {"""
if s.count(anchor) == 1:
    s = s.replace(anchor, guide, 1); rep.append('ok mount guide')
else:
    rep.append('FAIL mount anchor')

io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
print('\n'.join(rep))
