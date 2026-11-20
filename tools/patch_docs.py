# -*- coding: utf-8 -*-
import io, os
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(BASE, '..')
docs = io.open(os.path.join(ROOT, 'docs_v3.md'), encoding='utf-8').read()

r = io.open(os.path.join(ROOT, 'README.md'), encoding='utf-8').read()
r = r.replace('54 种宠物', '61 种宠物').replace('54 种', '61 种')
if 'v3「深度养成版」更新' not in r:
    r = r.rstrip() + '\n\n' + docs
io.open(os.path.join(ROOT, 'README.md'), 'w', encoding='utf-8', newline='\n').write(r)
print('README updated, chars', len(r))

p = os.path.join(ROOT, '安装说明_iPhone.md')
m = io.open(p, encoding='utf-8').read()
extra = """

---

### 这一版（v3 深度养成版）多出来的内容

- 图鉴 61 种、五维属性、星级、天赋（决定进化次数）、个体值、亲密度
- 菜单里的「宠物图鉴 / 进化 / 坐骑 / 秘传商人」四个新页面
- 坐骑：Lv20 以上终体宠可骑，海洋系能走水面、飞羽系可飞行、全体遇敌率 -50%
- 地图改为四向网状互通，不用再一路往上走
- 夜间才会出现的隐藏宠（夜影狐 / 暮翼魔 / 虹鳞圣龙）
"""
if 'v3 深度养成版' not in m:
    m = m.rstrip() + extra
io.open(p, 'w', encoding='utf-8', newline='\n').write(m)
print('install doc updated, chars', len(m))
