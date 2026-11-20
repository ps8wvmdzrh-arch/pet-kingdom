# -*- coding: utf-8 -*-
import io, os

BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8').read()
report = []

# ---------- 1. 战斗招式面板重排 ----------
start_marker = "    } else if (b.phase === 'skill') {"
end_marker = "    } else if (b.phase === 'ball') {"
a = s.find(start_marker)
b = s.find(end_marker)
if a < 0 or b < 0 or b < a:
    report.append('FAIL skill range')
else:
    new_skill = '''    } else if (b.phase === 'skill') {
      var lp = lead();
      var mvs = petMoves(lp);
      panel(10, 430, VW - 20, 204, 0.95, 12);
      text('选择招式', 22, 452, 12.5, '#ffe9a8', 'left', '800');
      text('能量 ' + Math.round(lp.mp) + '/' + lp.maxmp + ' · ' + TYPE_NAME[SPECIES[lp.id].type] + '系', 112, 452, 9.5, '#9fe8ff', 'left', '700');
      button('返回', VW - 78, 438, 62, 22, function () { ST.battle.phase = 'menu'; });
      if (!mvs.length) text('还没有可用招式', VW / 2, 500, 12, '#fff', 'center');
      for (var i = 0; i < Math.min(5, mvs.length); i++) {
        (function (idx) {
          var mv = mvs[idx];
          var enabled = lead().mp >= (mv.c || 0);
          var tag = mv.c ? '耗能 ' + mv.c : '无消耗';
          var label = mv.n + ' · 威力 ' + (mv.p || 0) + ' · ' + tag + (mv.eff === 'guard' ? ' · 减伤' : '');
          button(label, 18, 466 + idx * 33, VW - 36, 29,
            enabled ? function () { playerSkill(idx); } : function () { toast('能量不足'); },
            enabled ? 'main' : '');
        })(i);
      }
'''
    s = s[:a] + new_skill + s[b:]
    report.append('ok skill panel')

# ---------- 2. 详情页：生命条标尺 + 补充记录区 ----------
old_life = "      ['生命', maxhpOf(probe), maxhpOf(probe), '#5cd97a'],"
new_life = "      ['生命', maxhpOf(probe), 240, '#5cd97a'],"
if s.count(old_life) == 1:
    s = s.replace(old_life, new_life, 1); report.append('ok life bar')
else:
    report.append('FAIL life bar')

anchor = "    if (pet && pet.secret && SECRET[pet.secret]) text('秘传：' + SECRET[pet.secret].n, 24, my + how.length * 15 + 38, 9.5, '#9fe8ff', 'left', '600');"
add = anchor + """
    var iy = my + how.length * 15 + 54;
    panel(20, iy, VW - 40, 86, 0.34, 10);
    text('图鉴记录：' + (st >= 3 ? '已进化获得' : st >= 2 ? '已捕获' : st ? '仅见过' : '尚未发现'), 30, iy + 18, 9.5, '#fff', 'left', '600');
    text('捕获基准 ' + Math.round((sp.cr || 0.3) * 100) + '% · ' + (sp.star || 2) + ' 星 · 第 ' + ((sp.tier || 0) + 1) + ' 阶', 30, iy + 34, 9, 'rgba(255,255,255,0.75)', 'left', '600');
    text(pet ? ('天赋 ' + TAL_NAME[pet.tal] + ' · 亲密 ' + Math.round(pet.bond || 0) + '/100 · 已进化 ' + (pet.evo || 0) + ' 次') : '天赋与个体值需捕获后查看', 30, iy + 50, 9, '#ffe9a8', 'left', '600');
    text('属性：' + TYPE_NAME[sp.type] + '系，' + (PASSIVE[sp.type] ? PASSIVE[sp.type].n : '') + '；' + (sp.mount ? '可作坐骑' : '不可骑乘'), 30, iy + 66, 8.5, 'rgba(255,255,255,0.6)', 'left', '600');"""
if s.count(anchor) == 1:
    s = s.replace(anchor, add, 1); report.append('ok entry panel')
else:
    report.append('FAIL entry anchor')

# ---------- 3. 坐骑页补充指南 ----------
manchor = "    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });\n  }\n\n  function drawDex()"
guide = """    var mlist = DEX_ORDER.filter(function (id) { return SPECIES[id].mount; });
    panel(18, 470, VW - 36, 88, 0.32, 10);
    text('可骑乘终体宠 ' + mlist.length + ' 种', 30, 488, 9.5, '#9fe8ff', 'left', '700');
    var groups = [['water', '涉水'], ['air', '飞行'], ['land', '疾驰']];
    groups.forEach(function (g, gi) {
      var names = mlist.filter(function (id) { return SPECIES[id].mount === g[0]; }).map(function (id) { return SPECIES[id].name; });
      if (!names.length) return;
      var line = g[1] + '：' + names.join('、');
      wrapText(line, VW - 70, 8.5).slice(0, 2).forEach(function (l, li) {
        text(l, 30, 504 + gi * 18 + li * 11, 8.5, 'rgba(255,255,255,0.72)', 'left', '600');
      });
    });
    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });
  }

  function drawDex()"""
if s.count(manchor) == 1:
    s = s.replace(manchor, guide, 1); report.append('ok mount guide')
else:
    report.append('FAIL mount anchor')

io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
print('\n'.join(report))
