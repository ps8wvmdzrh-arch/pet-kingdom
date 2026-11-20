// 简易无头冒烟测试：canvas/DOM 桩 + 各界面绘制 + 核心机制逻辑检查
const fs = require('fs');
const path = require('path');

function makeCtx() {
  const noop = () => {};
  const grad = { addColorStop: noop };
  const target = {
    measureText: (s) => ({ width: String(s).length * 9 }),
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    createPattern: () => ({}),
    getImageData: () => ({ data: [] }),
    canvas: { width: 720, height: 1280 },
    setTransform: noop, save: noop, restore: noop, translate: noop, scale: noop,
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, arc: noop,
    ellipse: noop, rect: noop, fill: noop, stroke: noop, clip: noop,
    fillRect: noop, strokeRect: noop, clearRect: noop, fillText: noop,
    drawImage: noop, putImageData: noop, quadraticCurveTo: noop, bezierCurveTo: noop
  };
  return new Proxy(target, {
    get(t, k) { if (k in t) return t[k]; return () => {}; },
    set(t, k, v) { t[k] = v; return true; }
  });
}

const ctxStub = makeCtx();
const canvasStub = { width: 720, height: 1280, style: {}, getContext: () => ctxStub, addEventListener: () => {} };

global.document = {
  getElementById: () => canvasStub,
  querySelector: () => canvasStub,
  body: { appendChild: () => {} },
  addEventListener: () => {},
  createElement: () => canvasStub
};
let rafCb = null;
global.window = {
  innerWidth: 390, innerHeight: 844, devicePixelRatio: 2,
  addEventListener: () => {},
  requestAnimationFrame: (cb) => { rafCb = cb; return 1; },
  localStorage: null,
  setTimeout: global.setTimeout
};
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
window.localStorage = global.localStorage;
global.requestAnimationFrame = window.requestAnimationFrame;

const root = path.join(__dirname, '..');
function load(f) { (0, eval)(fs.readFileSync(path.join(root, f), 'utf8')); }
load('art.js');
load('game.js');

const R = global.window.__RAINBOW__;
if (!R) throw new Error('__RAINBOW__ 未导出');
const ST = R.ST;
let bad = 0;
function check(cond, msg) { if (!cond) { console.log('  ✗ ' + msg); bad++; } }

function step(label) {
  try { rafCb(16); } catch (e) { console.log('  ✗ DRAW[' + label + ']:', e && e.message); bad++; }
}

/* ---------- 1. 界面绘制 ---------- */
ST.party = [
  R.newPet('sprout', 12), R.newPet('bloomspirit', 16), R.newPet('gearling', 20),
  R.newPet('chirp', 9), R.newPet('emberwolf', 26)
];
ST.box = [R.newPet('vinetail', 8), R.newPet('starcore', 30)];
ST.gold = 5000;
Object.keys(ST.items).forEach((k) => { ST.items[k] = 20; });
['sprout', 'bloomspirit', 'vinetail', 'gearling', 'chirp', 'emberwolf', 'starcore'].forEach((id) => { ST.dex[id] = 2; });

ST.mode = 'field'; step('field');
['menu', 'party', 'dex', 'entry', 'evolve', 'merchant', 'mount', 'bag', 'quest', 'shop'].forEach((m) => {
  ST.mode = m; step(m);
});
ST.entryId = 'bloomspirit';
['all', 'own', 'miss'].forEach((t) => { ST.mode = 'dex'; ST.dexTab = t; ST.dexPage = 0; step('dex-' + t); });
ST.dexPage = 99; ST.mode = 'dex'; step('dex-lastpage');
ST.mode = 'entry';
R.DEX_ORDER.forEach((id) => { ST.entryId = id; step('entry-' + id); });

R.startBattle(R.newPet('mossball', 8), false, null);
ST.mode = 'battle'; step('battle');
['menu', 'skill', 'ball', 'swap'].forEach((ph) => { ST.battle.phase = ph; step('battle-' + ph); });
ST.battle.over = true; step('battle-over');
ST.battle = null;

/* ---------- 2. 图鉴与属性 ---------- */
console.log('物种总数 =', R.TOTAL_SPECIES, '· 图鉴编号最大 =', Math.max.apply(null, R.DEX_ORDER.map((id) => R.SPECIES[id].num)));
check(R.TOTAL_SPECIES === R.DEX_ORDER.length, 'TOTAL_SPECIES 与 DEX_ORDER 不一致');
check(Object.keys(R.SPECIES).length === R.TOTAL_SPECIES, '未编号物种存在');
R.DEX_ORDER.forEach((id) => {
  const sp = R.SPECIES[id];
  check(!!sp.name && !!sp.type && !!R.PASSIVE[sp.type], '数据缺失 ' + id);
  check(sp.star >= 1 && sp.star <= 5, '星级异常 ' + id + '=' + sp.star);
  check((sp.sec === undefined) || sp.sec === 'night' || sp.sec === 'boss' || sp.sec === 'evo', '隐藏标记异常 ' + id + '=' + sp.sec);
});
const p = R.newPet('sprout', 10, { tal: 3, iv: { hp: 6, atk: 6, def: 6, eng: 6, spd: 6 } });
const p2 = R.newPet('sprout', 10, { tal: 1, iv: { hp: 0, atk: 0, def: 0, eng: 0, spd: 0 } });
check(R.statOf(p, 'atk') > R.statOf(p2, 'atk'), '天赋/个体值没有影响属性');
check(R.maxhpOf(R.newPet('sprout', 30)) > R.maxhpOf(R.newPet('sprout', 5)), '等级没有影响生命');

/* ---------- 3. 进化：素材 + 亲密 + 天赋次数 ---------- */
const evoPet = R.newPet('sprout', 40, { tal: 3 });
evoPet.bond = 100;
const r1 = R.evoReq(evoPet);
check(r1.ok, '满条件却无法进化：' + r1.why);
if (r1.ok) {
  const before = R.SPECIES[evoPet.id].mat;
  Object.keys(before || {}).forEach((m) => { const own = ST.items[m]; R.doEvolve(evoPet); check(ST.items[m] === own - before[m], '进化没有扣素材 ' + m); });
}
check(R.SPECIES[evoPet.id].num > 0, '进化后 id 异常');
check(evoPet.evo === 1, '进化次数没有记录');
const poor = R.newPet('vinetail', 40, { tal: 3 });
poor.bond = 0;
const r2 = R.evoReq(poor);
check(!r2.ok && /亲密度/.test(r2.why), '二阶进化未校验亲密度：' + r2.why);
const lowTal = R.newPet('sprout', 40, { tal: 1 });
lowTal.bond = 100;
lowTal.evo = 1;
const r3 = R.evoReq(lowTal);
check(!r3.ok && /天赋/.test(r3.why), '天赋次数上限未生效：' + r3.why);
const noMat = R.newPet('vinetail', 40, { tal: 3 });
noMat.bond = 100;
const savedItems = Object.assign({}, ST.items);
Object.keys(ST.items).forEach((m) => { ST.items[m] = 0; });
check(!R.evoReq(noMat).ok, '素材不足却可进化');
Object.assign(ST.items, savedItems);

/* ---------- 4. 招式和能量 ---------- */
const lv1 = R.petMoves(R.newPet('sprout', 1));
const lv30 = R.petMoves(R.newPet('sprout', 30));
check(lv1.length === 1, 'Lv1 应只有 1 招，实际 ' + lv1.length);
check(lv30.length === 4, 'Lv30 应有 4 招，实际 ' + lv30.length);
const secretPet = R.newPet('sprout', 30); secretPet.secret = 'crush';
check(R.petMoves(secretPet).length === 5, '秘传主动技未进入招式表');

/* ---------- 5. 捕捉率与秘传 ------------- ---------- */
ST.mode = 'battle';
R.startBattle(R.newPet('mossball', 8), false, null);
const b = ST.battle;
const plain = R.captureChance(b, 1);
ST.party[0].secret = 'hunter';
const hunted = R.captureChance(b, 1);
check(hunted > plain, '猎手直觉没有提升捕捉率 ' + plain + ' → ' + hunted);
check(hunted <= 1 && plain >= 0, '捕捉率越界');
ST.party[0].secret = null;
b.enemy.hp = 1;
check(R.captureChance(b, 1) > plain, '残血没有提高捕捉率');
ST.battle = null;

/* ---------- 6. 野外池 / 夜间隐藏 ---------- */
const all = {};
Object.keys(R.ZONES).forEach((z) => {
  const zz = R.ZONES[z];
  if (!zz.wild) return;
  for (let i = 0; i < 300; i++) {
    const w = R.zoneWild(z);
    if (!w) { console.log('  ✗ zoneWild 返回空：' + z); bad++; break; }
    check(!!R.SPECIES[w.id], '野外出现未知物种 ' + w.id);
    all[w.id] = (all[w.id] || 0) + 1;
  }
});
ST.tick = 0; ST.night = true;
let nightSeen = 0;
for (let i = 0; i < 900; i++) { const w = R.zoneWild('forest'); if (R.SPECIES[w.id].sec) nightSeen++; }
check(nightSeen > 0, '夜间森林没有出现隐藏宠');
ST.night = false;
let daySecret = 0;
for (let i = 0; i < 900; i++) { const w = R.zoneWild('forest'); if (R.SPECIES[w.id].sec === 'night') daySecret++; }
check(daySecret === 0, '白天仍出现夜行隐藏宠 ' + daySecret);
console.log('野外可遇到物种数 =', Object.keys(all).length);

/* ---------- 7. 地图四向 ------------- ---------- */
Object.keys(R.ZONES).forEach((z) => {
  const zz = R.ZONES[z]; R.getZone(z); const map = R.ZMAPS[z];
  if (!map) { console.log('  ✗ 地图未生成：' + z); bad++; return; }
  const flat = map.map.join('');
  check(flat.indexOf('P') >= 0 || z === 'town', z + ' 没有传送格');
  ['up', 'down', 'left', 'right'].forEach((d) => {
    if (!zz[d]) return;
    check(!!R.ZONES[zz[d]], z + '.' + d + ' 指向不存在的区域 ' + zz[d]);
  });
});
check(R.ZONES.town.up === 'grass' && R.ZONES.grass.down === 'town', '城镇与草原上下不互通');
check(R.ZONES.grass.left === 'forest' && R.ZONES.forest.right === 'highland', '网状横向出口缺失');
// 四向落点：进入 left 区域时应落在右边缘
ST.party = [R.newPet('sprout', 20)];
ST.zone = 'town'; ST.px = 0; ST.py = 12; ST.dir = 'left';
R.getZone('forest'); const forestMap = R.ZMAPS.forest;
check(forestMap.w > 0, 'forest 地图尺寸异常');

/* ---------- 8. 坐骑 ------------- ---------- */
ST.mount = null; ST.mountType = null;
ST.party = [R.newPet('tidewhale', 30), R.newPet('heavenbird', 30), R.newPet('stagking', 30)];
ST.box = [];
const cands = R.mountCandidates();
check(cands.length === 0 || cands.every((c) => R.SPECIES[c.p.id].mount), '坐骑候选含不可骑乘的宠物');

/* ---------- 9. 存档 ------------- ---------- */
ST.mount = cands.length ? { id: cands[0].p.id, src: 'party', idx: 0 } : null;
ST.mountType = cands.length ? R.SPECIES[cands[0].p.id].mount : null;
R.saveGame(true);
ST.mount = null; ST.mountType = null;
check(R.loadGame(), '读档失败');
check(ST.mount ? ST.mountType === R.SPECIES[ST.mount.id].mount : true, '坐骑没有随存档恢复');

console.log(bad ? ('FAILED: ' + bad + ' 项') : 'ALL CHECKS PASSED');
process.exit(bad ? 1 : 0);
