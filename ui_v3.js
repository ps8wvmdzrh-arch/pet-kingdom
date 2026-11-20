  /* ============================ v3 图鉴 / 进化 / 商人 / 坐骑 ============================ */

  function pad3(n) { return ('00' + n).slice(-3); }
  function starStr(n) { var s = ''; for (var i = 0; i < n; i++) s += '★'; return s; }
  function ssp(id) { return Object.assign({}, SPECIES[id], { shape: SPECIES[id].shape, evoIndex: evoIndex(id) }); }
  function dexState(id) { return (ST.dex || {})[id] || 0; }
  function parentOf(id) {
    for (var k in SPECIES) if (SPECIES[k].evo === id) return k;
    return null;
  }
  function rootOf(id) {
    var cur = id, guard = 0, par;
    while (guard++ < 8 && (par = parentOf(cur))) cur = par;
    return cur;
  }
  function fullChain(id) {
    var cur = rootOf(id), out = [cur], guard = 0;
    while (guard++ < 8) {
      var sp = SPECIES[cur];
      if (!sp || !sp.evo) break;
      out.push(sp.evo); cur = sp.evo;
    }
    return out;
  }
  function habitatOf(id) {
    var zs = [];
    for (var z in ZONES) if (ZONES[z].wild && ZONES[z].wild.indexOf(id) >= 0) zs.push(ZONES[z].name);
    return zs;
  }
  function howText(id) {
    var sp = SPECIES[id];
    var hab = habitatOf(id);
    if (hab.length) return '捕捉：' + hab.join(' / ') + ' 的野外';
    if (sp.sec === 'night') return '隐藏：夜间在幽森、风羽高地、岩铁洞窟、天空之塔低概率出现';
    if (sp.sec === 'boss') return '隐藏：击败蚀王后，在天空之塔夜间低概率现身';
    if (sp.sec === 'evo') return '特殊进化：' + SPECIES[rootOf(id)].name + ' 携带星核进化';
    var par = parentOf(id);
    return par ? '进化：由 ' + SPECIES[par].name + ' 进化而来' : '来历不明';
  }
  function matText(id) {
    var sp = SPECIES[id], parts = [];
    if (sp.mat) for (var m in sp.mat) parts.push(MATS[m].n + '×' + sp.mat[m]);
    return parts.length ? parts.join('，') : '无需素材';
  }
  function statRow(label, val, max, y, color) {
    text(label, 30, y, 10.5, 'rgba(255,255,255,0.82)', 'left', '600');
    var w = 168, r = Math.max(0, Math.min(1, val / (max || 1)));
    rr2(70, y - 9, w, 9, 4); ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fill();
    rr2(71, y - 8, Math.max(3, (w - 2) * r), 7, 3.5); ctx.fillStyle = color; ctx.fill();
    text('' + val, 246, y, 10.5, '#fff', 'left', '700');
  }
  function tabBtn(label, x, y, w, h, active, fn) {
    rr2(x, y, w, h, 10);
    ctx.fillStyle = active ? 'rgba(255,196,66,0.95)' : 'rgba(255,255,255,0.12)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,200,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();
    text(label, x + w / 2, y + h / 2 + 1, 11.5, active ? '#3a2410' : '#fff', 'center', '700');
    addHit(x, y, w, h, fn);
  }

  function drawDex() {
    ctx.fillStyle = 'rgba(8,6,14,0.62)'; ctx.fillRect(0, 0, VW, VH);
    panel(10, 34, VW - 20, VW > 0 ? 578 : 578, 0.96, 16);
    text('宠物图鉴', 24, 60, 17, '#ffe9a8', 'left', '800');
    text(caughtCount() + ' / ' + TOTAL_SPECIES + ' 已捕获', VW - 24, 60, 11, 'rgba(255,255,255,0.7)', 'right', '700');

    tabBtn('全部', 18, 74, 104, 26, ST.dexTab === 'all', function () { ST.dexTab = 'all'; ST.dexPage = 0; });
    tabBtn('已捕获', 128, 74, 104, 26, ST.dexTab === 'own', function () { ST.dexTab = 'own'; ST.dexPage = 0; });
    tabBtn('未捕获', 238, 74, 104, 26, ST.dexTab === 'miss', function () { ST.dexTab = 'miss'; ST.dexPage = 0; });

    var list = DEX_ORDER.filter(function (id) {
      var st = dexState(id);
      if (ST.dexTab === 'own') return st >= 2;
      if (ST.dexTab === 'miss') return st < 2;
      return true;
    });
    var per = 8, pages = Math.max(1, Math.ceil(list.length / per));
    var page = Math.min(ST.dexPage || 0, pages - 1); ST.dexPage = page;
    var slice = list.slice(page * per, page * per + per);
    if (!slice.length) text('这个分类下还没有记录', VW / 2, 300, 13, 'rgba(255,255,255,0.6)', 'center');

    slice.forEach(function (id, i) {
      var y = 110 + i * 46, sp = SPECIES[id], st = dexState(id);
      panel(18, y, VW - 36, 42, st >= 2 ? 0.5 : (st ? 0.32 : 0.18), 9);
      text(pad3(sp.num), 26, y + 15, 9, 'rgba(255,255,255,0.55)', 'left', '600');
      if (st) drawPet(ctx, ssp(id), 52, y + 33, 26, { t: ST.time + i, flip: true });
      else {
        rr2(40, y + 12, 24, 24, 8); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
        text('?', 52, y + 25, 14, 'rgba(255,255,255,0.5)', 'center', '700');
      }
      text(st ? sp.name : '？？？', 76, y + 16, 12.5, st ? '#fff' : 'rgba(255,255,255,0.45)', 'left', '700');
      text(st ? starStr(sp.star || 2) + '  ' + TYPE_NAME[sp.type] + '系' : '尚未发现', 76, y + 32, 9.5, st ? '#ffe9a8' : 'rgba(255,255,255,0.4)', 'left', '600');
      var tag = st >= 3 ? '已进化' : st >= 2 ? '已捕获' : st ? '已见过' : '未发现';
      text(tag, VW - 28, y + 24, 9.5, st >= 2 ? '#7ef0a2' : 'rgba(255,255,255,0.45)', 'right', '700');
      (function (sid) {
        addHit(18, y, VW - 36, 42, function () {
          ST.entryId = sid; ST.entryPet = null; ST.mode = 'entry';
        });
      })(id);
    });

    button('上一页', 22, 480, 100, 30, function () { ST.dexPage = Math.max(0, (ST.dexPage || 0) - 1); });
    text((page + 1) + ' / ' + pages, VW / 2, 496, 11, 'rgba(255,255,255,0.7)', 'center', '600');
    button('下一页', VW - 122, 480, 100, 30, function () { ST.dexPage = Math.min(pages - 1, (ST.dexPage || 0) + 1); });
    button('返回', 60, 556, 240, 34, function () { ST.mode = 'menu'; });
  }

  function drawEntry() {
    var id = ST.entryId || DEX_ORDER[0];
    var sp = SPECIES[id], st = dexState(id), pet = ST.entryPet;
    ctx.fillStyle = 'rgba(8,6,14,0.66)'; ctx.fillRect(0, 0, VW, VH);
    panel(10, 18, VW - 20, 600, 0.96, 16);
    text('No.' + pad3(sp.num), 24, 44, 10.5, 'rgba(255,255,255,0.55)', 'left', '700');
    text(st ? sp.name : '？？？', 24, 66, 18, '#ffe9a8', 'left', '800');
    text(st ? starStr(sp.star || 2) : '', VW - 24, 62, 13, '#ffd447', 'right', '700');
    text(TYPE_NAME[sp.type] + '系 · ' + (TAL_NAME[pet ? pet.tal : 1] || '') , VW - 24, 44, 10, 'rgba(255,255,255,0.65)', 'right');

    if (st) drawPet(ctx, ssp(id), VW / 2, 116, 64, { t: ST.time });
    else {
      rr2(VW / 2 - 34, 82, 68, 68, 12); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
      text('?', VW / 2, 118, 30, 'rgba(255,255,255,0.5)', 'center', '800');
    }
    var line = PASSIVE[sp.type];
    text('特性「' + line.n + '」', 24, 166, 11, '#9fe8ff', 'left', '700');
    text(line.desc, 118, 166, 10, 'rgba(255,255,255,0.75)', 'left', '600');

    if (pet) {
      text('天赋 ' + TAL_NAME[pet.tal] + '（可进化 ' + pet.tal + ' 次，已用 ' + (pet.evo || 0) + '）  亲密 ' + Math.round(pet.bond || 0) + '/100', 24, 184, 9.5, '#ffe9a8', 'left', '600');
    }
    var probe = pet || newPet(id, 20);
    var y0 = pet ? 200 : 186;
    var stats = [
      ['生命', maxhpOf(probe), maxhpOf(probe), '#5cd97a'],
      ['力量', statOf(probe, 'atk'), 160, '#ff9d5c'],
      ['防御', statOf(probe, 'def'), 160, '#8fb6ff'],
      ['能量', maxmpOf(probe), 90, '#c58cff'],
      ['敏捷', statOf(probe, 'spd'), 160, '#7ef0d2']
    ];
    stats.forEach(function (s, i) { statRow(s[0], s[1], s[2], y0 + i * 19, s[3]); });
    probe.hp = probe.maxhp;

    var cy = y0 + 5 * 19 + 14;
    text('进化链', 24, cy, 11, 'rgba(255,255,255,0.75)', 'left', '700');
    var chain = fullChain(id);
    chain.forEach(function (cid, i) {
      var x = 24 + i * 78;
      var known = dexState(cid) > 0 || cid === id;
      if (known) drawPet(ctx, ssp(cid), x + 20, cy + 34, 26, { t: ST.time + i, flip: true });
      else { rr2(x + 6, cy + 20, 28, 28, 8); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); text('?', x + 20, cy + 36, 13, 'rgba(255,255,255,0.4)', 'center'); }
      text(known ? SPECIES[cid].name : '？？？', x + 20, cy + 56, 8.5, known ? '#fff' : 'rgba(255,255,255,0.4)', 'center', '600');
      if (i < chain.length - 1) text('→', x + 62, cy + 34, 11, '#ffd447', 'center', '700');
    });

    var my = cy + 70;
    var how = wrapText(howText(id), VW - 60, 10);
    how.forEach(function (l, i) { text(l, 24, my + i * 15, 10, 'rgba(255,255,255,0.8)', 'left', '600'); });
    text('素材：' + matText(id), 24, my + how.length * 15 + 6, 10, '#ffd447', 'left', '600');
    var moves = (sp.mv || TYPE_MOVES[sp.type]).map(function (m) { return m.n; });
    text('技能：' + moves.join(' / '), 24, my + how.length * 15 + 22, 9.5, 'rgba(255,255,255,0.7)', 'left', '600');
    if (pet && pet.secret && SECRET[pet.secret]) text('秘传：' + SECRET[pet.secret].n, 24, my + how.length * 15 + 38, 9.5, '#9fe8ff', 'left', '600');

    button('上一个', 24, 556, 96, 32, function () { stepEntry(-1); });
    button('返回图鉴', 132, 556, 96, 32, function () { ST.mode = 'dex'; });
    button('下一个', 240, 556, 96, 32, function () { stepEntry(1); });
  }

  function stepEntry(d) {
    var id = ST.entryId || DEX_ORDER[0];
    var i = DEX_ORDER.indexOf(id);
    i = (i + d + DEX_ORDER.length) % DEX_ORDER.length;
    ST.entryId = DEX_ORDER[i]; ST.entryPet = null;
  }

  function drawEvolve() {
    ctx.fillStyle = 'rgba(8,6,14,0.62)'; ctx.fillRect(0, 0, VW, VH);
    panel(10, 30, VW - 20, 584, 0.96, 16);
    text('进化炉', 24, 56, 17, '#ffe9a8', 'left', '800');
    text('天赋决定可进化次数', VW - 24, 56, 9.5, 'rgba(255,255,255,0.6)', 'right', '600');

    var all = [];
    ST.party.forEach(function (p, i) { all.push({ p: p, src: 'party', idx: i }); });
    ST.box.forEach(function (p, i) { all.push({ p: p, src: 'box', idx: i }); });
    var list = all.filter(function (r) { return SPECIES[r.p.id].evo; });
    if (!list.length) text('队伍里还没有可以进化的伙伴', VW / 2, 300, 12, 'rgba(255,255,255,0.6)', 'center');

    list.slice(0, 5).forEach(function (r, i) {
      var y = 76 + i * 92, p = r.p, sp = SPECIES[p.id], req = evoReq(p), nx = SPECIES[sp.evo] || {};
      panel(18, y, VW - 36, 84, 0.45, 10);
      drawPet(ctx, ssp(p.id), 56, y + 60, 34, { t: ST.time + i, flip: true });
      text(sp.name + ' Lv' + p.lv + ' → ' + (nx.name || ''), 84, y + 18, 11.5, '#fff', 'left', '700');
      text('天赋 ' + TAL_NAME[p.tal] + ' · 已进化 ' + (p.evo || 0) + '/' + p.tal + ' 次 · 亲密 ' + Math.round(p.bond || 0), 84, y + 34, 9, '#ffe9a8', 'left', '600');
      var why = req.why.length > 30 ? req.why.slice(0, 30) + '…' : req.why;
      text(why, 84, y + 50, 9, req.ok ? '#7ef0a2' : 'rgba(255,120,120,0.9)', 'left', '600');
      text('素材 ' + matText(p.id), 84, y + 66, 8.5, 'rgba(255,255,255,0.6)', 'left', '600');
      (function (rr, yy) {
        button('进化', VW - 96, yy + 50, 66, 28, function () {
          var res = evoReq(rr.p);
          if (!res.ok) { toast(res.why); return; }
          doEvolve(rr.p);
          toast(SPECIES[rr.p.id].name + ' 进化成功！');
        }, 'main');
      })(r, y);
    });
    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });
  }

  function drawMerchant() {
    ctx.fillStyle = 'rgba(8,6,14,0.62)'; ctx.fillRect(0, 0, VW, VH);
    panel(10, 24, VW - 20, 594, 0.96, 16);
    text('秘传商人 · 灰袍', 24, 52, 16, '#ffe9a8', 'left', '800');
    text('金币 ' + ST.gold, VW - 24, 52, 11, '#ffd447', 'right', '700');
    var target = ST.party[ST.secretSel | 0] || ST.party[0];
    text('传授对象：' + (target ? SPECIES[target.id].name + ' Lv' + target.lv : '无'), 24, 74, 10.5, '#fff', 'left', '700');
    button('换一只', VW - 96, 62, 76, 24, function () { ST.secretSel = ((ST.secretSel | 0) + 1) % Math.max(1, ST.party.length); });

    var keys = Object.keys(SECRET);
    keys.forEach(function (k, i) {
      var s = SECRET[k], y = 100 + i * 86;
      panel(18, y, VW - 36, 78, 0.45, 10);
      text(s.n, 30, y + 18, 12, '#9fe8ff', 'left', '800');
      var dl = wrapText(s.desc, 200, 9);
      dl.forEach(function (l, j) { text(l, 30, y + 34 + j * 13, 9, 'rgba(255,255,255,0.78)', 'left', '600'); });
      text('素材 ' + matText2(s.mat), 30, y + 66, 8.5, 'rgba(255,255,255,0.6)', 'left', '600');
      var learned = target && target.secret === k;
      text((learned ? '已掌握' : s.price + ' 金'), VW - 96, y + 18, 9.5, learned ? '#7ef0a2' : '#ffd447', 'right', '700');
      (function (key, yy) {
        button(learned ? '已学' : '学习', VW - 92, yy + 42, 64, 26, function () {
          if (!target) { toast('还没有伙伴'); return; }
          if (KEY_learned(target, key)) { toast('对象已掌握该秘传'); return; }
          var sec = SECRET[key], okMat = true;
          if (sec.mat) for (var m in sec.mat) if ((ST.items[m] || 0) < sec.mat[m]) okMat = false;
          if (ST.gold < sec.price) { toast('金币不够'); return; }
          if (!okMat) { toast('素材不够：' + matText2(sec.mat)); return; }
          ST.gold -= sec.price;
          if (sec.mat) for (var m2 in sec.mat) ST.items[m2] -= sec.mat[m2];
          target.secret = key;
          toast(target ? SPECIES[target.id].name + ' 学会了「' + sec.n + '」' : '学会了');
          saveGame(true);
        }, learned ? 'main' : 'main');
      })(k, y);
    });
    if (ST.shopMsg) text(ST.shopMsg, 24, 542, 10, '#ffd447', 'left', '600');
    button('返回', 80, 560, 200, 32, function () { ST.mode = 'menu'; });
  }
  function KEY_learned(p, k) { return p && p.secret === k; }
  function matText2(mat) {
    if (!mat) return '无';
    var parts = [];
    for (var m in mat) parts.push(MATS[m].n + '×' + mat[m]);
    return parts.join('，');
  }

  function drawMount() {
    ctx.fillStyle = 'rgba(8,6,14,0.62)'; ctx.fillRect(0, 0, VW, VH);
    panel(10, 30, VW - 20, 584, 0.96, 16);
    text('坐骑厩', 24, 56, 17, '#ffe9a8', 'left', '800');
    text('当前：' + mountLabel(), VW - 24, 56, 10, '#9fe8ff', 'right', '700');
    text('Lv20 以上的终体宠可以骑乘', 24, 78, 9.5, 'rgba(255,255,255,0.62)', 'left', '600');

    var cands = mountCandidates();
    if (!cands.length) {
      text('还没有可骑乘的伙伴', VW / 2, 200, 12, 'rgba(255,255,255,0.6)', 'center');
      text('把水系/飞羽系/猛兽系的终体宠练到 Lv20 吧', VW / 2, 224, 10, 'rgba(255,255,255,0.5)', 'center');
    }
    cands.slice(0, 4).forEach(function (r, i) {
      var p = r.p, y = 96 + i * 96, sp = SPECIES[p.id];
      panel(18, y, VW - 36, 88, 0.45, 10);
      drawPet(ctx, ssp(p.id), 60, y + 64, 42, { t: ST.time + i, flip: true });
      text(sp.name + ' Lv' + p.lv, 96, y + 22, 12, '#fff', 'left', '700');
      text(starStr(sp.star || 2) + '  ' + ({ water: '涉水（可走水面）', air: '飞行（可越水与崖）', land: '疾驰（移动更快）' })[sp.mount], 96, y + 40, 9, '#ffe9a8', 'left', '600');
      text('遇敌率 -50%', 96, y + 56, 9, 'rgba(255,255,255,0.65)', 'left', '600');
      text(TYPE_NAME[sp.type] + '系  ' + PASSIVE[sp.type].n, 96, y + 72, 8.5, 'rgba(255,255,255,0.55)', 'left', '600');
      var riding = ST.mount && ST.mount.src === r.src && ST.mount.idx === r.idx;
      (function (rec, yy, on) {
        button(on ? '下坐骑' : '骑乘', VW - 92, yy + 30, 66, 30, function () {
          setMount(rec); saveGame(true);
        }, on ? 'warn' : 'main');
      })(r, y, riding);
    });
    button('返回', 80, 556, 200, 32, function () { ST.mode = 'menu'; });
  }

