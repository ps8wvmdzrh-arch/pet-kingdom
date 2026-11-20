  function swapLead(idx) {
    if (idx <= 0 || idx >= ST.party.length) return;
    var t = ST.party[0]; ST.party[0] = ST.party[idx]; ST.party[idx] = t;
    toast('首发换成了 ' + SPECIES[ST.party[0].id].name);
  }

  function drawParty() {
    ctx.fillStyle = 'rgba(10,8,18,0.55)'; ctx.fillRect(0, 0, VW, VH);
    panel(12, 46, VW - 24, 520, 0.95, 16);
    text('我的伙伴', 26, 70, 15, '#ffe9a8', 'left', '800');
    text('点击查看详情', VW - 26, 70, 10, 'rgba(255,255,255,0.62)', 'right');
    ST.party.forEach(function (p, i) {
      var y = 82 + i * 84, sp = SPECIES[p.id];
      panel(22, y, VW - 44, 76, 0.5, 10);
      drawPet(ctx, ssp(p.id), 56, y + 66, 38, { t: ST.time + i, flip: true });
      text(sp.name + '  Lv' + p.lv, 84, y + 18, 12, '#fff', 'left', '700');
      text(starStr(sp.star || 2) + ' ' + TYPE_NAME[sp.type] + '系 · ' + TAL_NAME[p.tal || 1], 84, y + 34, 9, '#ffe9a8', 'left', '600');
      text('亲密 ' + Math.round(p.bond || 0) + '/100 · 能量 ' + Math.round(p.mp) + '/' + p.maxmp, 84, y + 48, 8.5, 'rgba(255,255,255,0.72)', 'left', '600');
      var r = p.hp / p.maxhp;
      hpBar(84, y + 58, 118, 6, r, r > 0.5 ? '#5cd97a' : r > 0.2 ? '#ffd447' : '#ff5f5f');
      text(Math.round(p.hp) + '/' + p.maxhp, 208, y + 60, 8.5, 'rgba(255,255,255,0.7)', 'left');
      (function (idx) {
        button(idx ? '设为首发' : '出战中', 232, y + 12, 70, 24, function () { swapLead(idx); }, idx ? '' : 'main');
      })(i);
      (function (q) {
        addHit(22, y, 204, 76, function () {
          ST.entryId = q.id; ST.entryPet = q; ST.entryPetRef = q; ST.mode = 'entry';
        });
      })(p);
    });
    if (!ST.party.length) text('还没有伙伴', VW / 2, 300, 13, '#fff', 'center');
    text('牧场 ' + ST.box.length + ' 只 · 图鉴 ' + caughtCount() + '/' + TOTAL_SPECIES + ' · ' + mountLabel(), 26, 508, 9.5, 'rgba(255,255,255,0.66)');
    button('返回', 80, 526, 200, 34, function () { ST.mode = 'menu'; });
  }

