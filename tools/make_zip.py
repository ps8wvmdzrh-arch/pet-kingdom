# -*- coding: utf-8 -*-
import os, zipfile
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, '..'))
out = os.path.join(ROOT, '虹光宠物物语_v3_iOS包.zip')
skip_dirs = {'.git', 'ipa', 'ipa_v3', 'shots', 'shots3', 'node_modules'}
skip_ext = {'.ipa'}
cnt = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for f in files:
            if f.lower().endswith('.ipa') or f.endswith('.zip'):
                continue
            p = os.path.join(root, f)
            rel = os.path.relpath(p, ROOT)
            z.write(p, rel)
            cnt += 1
print('zipped', cnt, 'files ->', out, os.path.getsize(out))
