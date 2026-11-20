# -*- coding: utf-8 -*-
import io, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
UI = os.path.join(BASE, '..', 'ui_v3.js')
PARTY = os.path.join(BASE, 'party_v3.js')

src = io.open(G, 'r', encoding='utf-8').read()
ui = io.open(UI, 'r', encoding='utf-8').read()
party = io.open(PARTY, 'r', encoding='utf-8').read()

report = []

def rep(old, new, tag):
    global src
    n = src.count(old)
    if n != 1:
        report.append('FAIL(%d) %s' % (n, tag))
        return
    src = src.replace(old, new, 1)
    report.append('ok %s' % tag)

# 1. lead() 返回首个宠物（可重复执行）
if 'function lead() { return ST.party; }' in src:
    src = src.replace('function lead() { return ST.party; }', 'function lead() { return ST.party[0]; }', 1)
    report.append('ok lead')
elif 'function lead() { return ST.party[0]; }' in src:
    report.append('ok lead (already)')
else:
    report.append('FAIL lead')

# 2. ST 增加坐骑/图鉴游标字段
rep("dex: {}, tick: 0, night: false, streak: 0, dexSel: null, dexTab: 'all', secretNote: ''",
    "dex: {}, tick: 0, night: false, streak: 0, dexSel: null, dexTab: 'all', secretNote: '',\n    dexPage: 0, entryId: null, entryPet: null, secretSel: 0, mount: null, mountType: null",
    'st-fields')

# 3. 存档写坐骑
rep("dex: ST.dex, tick: ST.tick, night: ST.night, streak: ST.streak",
    "dex: ST.dex, tick: ST.tick, night: ST.night, streak: ST.streak, mount: ST.mount, mountType: ST.mountType",
    'save-mount')

# 4. 读档恢复坐骑
rep("      ST.dex = d.dex || {}; ST.tick = d.tick || 0; ST.night = !!d.night; ST.streak = d.streak || 0;",
    "      ST.dex = d.dex || {}; ST.tick = d.tick || 0; ST.night = !!d.night; ST.streak = d.streak || 0;\n"
    "      ST.mount = d.mount || null; ST.mountType = d.mountType || null;\n"
    "      if (ST.mount && (!SPECIES[ST.mount.id] || !SPECIES[ST.mount.id].mount)) { ST.mount = null; ST.mountType = null; }",
    'load-mount')

# 5. 插入 v3 界面（图鉴/详情/进化/商人/坐骑）
marker = '  function drawParty() {'
if src.count(marker) != 1:
    report.append('FAIL drawParty not unique')
else:
    src = src.replace(marker, ui + marker, 1)
    report.append('ok insert-ui')

# 6. 用新 drawParty 替换旧实现
start = src.find('  function drawParty() {')
end = src.find('  function drawBag() {')
if start < 0 or end < 0 or end < start:
    report.append('FAIL party replace range')
else:
    src = src[:start] + party + src[end:]
    report.append('ok party')

# 7. frame 分发
rep("    else if (ST.mode === 'quest') { drawField(); drawQuest(); }",
    "    else if (ST.mode === 'quest') { drawField(); drawQuest(); }\n"
    "    else if (ST.mode === 'dex') { drawField(); drawDex(); }\n"
    "    else if (ST.mode === 'entry') { drawField(); drawEntry(); }\n"
    "    else if (ST.mode === 'evolve') { drawField(); drawEvolve(); }\n"
    "    else if (ST.mode === 'merchant') { drawField(); drawMerchant(); }\n"
    "    else if (ST.mode === 'mount') { drawField(); drawMount(); }",
    'frame-dispatch')

# 8. 商人地砖造型
rep("    } else if (ch === 'C') {",
    "    } else if (ch === 'M') {\n"
    "      ctx.save();\n"
    "      ctx.globalAlpha = 0.9;\n"
    "      ctx.fillStyle = '#2c2340';\n"
    "      ctx.beginPath(); ctx.moveTo(sx + 12, sy + 1); ctx.lineTo(sx + 23, sy + 22); ctx.lineTo(sx + 1, sy + 22); ctx.closePath(); ctx.fill();\n"
    "      ctx.fillStyle = '#6b5a95';\n"
    "      ctx.beginPath(); ctx.arc(sx + 12, sy + 6, 5, 0, Math.PI * 2); ctx.fill();\n"
    "      ctx.fillStyle = 'rgba(255,214,110,0.9)';\n"
    "      ctx.beginPath(); ctx.arc(sx + 22, sy + 16, 3.2, 0, Math.PI * 2); ctx.fill();\n"
    "      ctx.fillStyle = 'rgba(255,214,110,0.28)';\n"
    "      ctx.beginPath(); ctx.arc(sx + 22, sy + 16, 7.5, 0, Math.PI * 2); ctx.fill();\n"
    "      ctx.restore();\n"
    "    } else if (ch === 'C') {",
    'prop-M')

# 9. 战斗技能菜单改用 petMoves + 能量
rep("      var sp = SPECIES[lead().id];\n      var mvs = MOVES[sp.type];\n"
    "      var unlocked = 1 + (lead().lv >= 8 ? 1 : 0) + (lead().lv >= 16 ? 1 : 0);",
    "      var lp = lead();\n      var mvs = petMoves(lp);\n"
    "      text('能量 ' + Math.round(lp.mp) + '/' + lp.maxmp + '  ·  ' + TYPE_NAME[SPECIES[lp.id].type] + '系', 20, 402, 10, '#9fe8ff', 'left', '700');",
    'skill-head')

rep("      for (var i = 0; i < 3; i++) {", "      for (var i = 0; i < Math.min(5, mvs.length); i++) {", 'skill-loop')
rep("          var enabled = idx < unlocked;", "          var enabled = lead().mp >= (mvs[idx].c || 0);", 'skill-enabled')
rep("          var label = enabled ? mvs[idx].n + ' · 威力 ' + mvs[idx].p : '？？？（Lv' + (idx === 1 ? 8 : 16) + ' 解锁）';",
    "          var label = mvs[idx].n + ' · 威力 ' + (mvs[idx].p || 0) + (mvs[idx].c ? ' · 耗能 ' + mvs[idx].c : ' · 无消耗');",
    'skill-label')
rep("          button(label, 16, 420 + idx * 50, VW - 32, 44,", "          button(label, 16, 424 + idx * 34, VW - 32, 30,", 'skill-btn-pos')
rep("            enabled ? function () { playerSkill(idx); } : function () { toast('等级不足'); },",
    "            enabled ? function () { playerSkill(idx); } : function () { toast('能量不足'); },", 'skill-disabled-msg')
rep("      button('返回', 100, 576, 160, 36, function () { ST.battle.phase = 'menu'; });",
    "      button('返回', VW - 78, 394, 62, 24, function () { ST.battle.phase = 'menu'; });", 'skill-back')

# 10. 捕捉界面显示猎手直觉
rep("      text('血量越低越容易捕捉', VW / 2, 562, 10, 'rgba(255,255,255,0.55)', 'center');",
    "      text('血量越低越好抓 · ' + (hasHunter(lead()) ? '猎手直觉 +25%' : '秘传「猎手直觉」可 +25%'), VW / 2, 562, 10, 'rgba(255,255,255,0.6)', 'center');",
    'ball-hunter')

if any(r.startswith('FAIL') for r in report):
    print('\n'.join(report))
    sys.exit(1)

io.open(G, 'w', encoding='utf-8', newline='\n').write(src)
print('\n'.join(report))
print('bytes:', len(src))
